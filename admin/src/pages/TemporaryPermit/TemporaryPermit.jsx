import { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";

// Lazy load modals for better performance
const PermitBillModal = lazy(() => import("../../components/PermitBillModal"));
const SharePermitModal = lazy(() => import("../../components/SharePermitModal"));
const IssueTemporaryPermitModal = lazy(() => import("./components/IssueTemporaryPermitModal"));
const RenewTemporaryPermitModal = lazy(() => import("./components/RenewTemporaryPermitModal"));
const EditTemporaryPermitModal = lazy(() => import("./components/EditTemporaryPermitModal"));
import AddButton from "../../components/AddButton";
import SearchBar from "../../components/SearchBar";
import StatisticsCard from "../../components/StatisticsCard";
import MobileCardView from "../../components/MobileCardView";
import { getTheme, getVehicleNumberDesign } from "../../context/ThemeContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

import { getStatusColor, getStatusText } from "../../utils/statusUtils";
import { getVehicleNumberParts } from "../../utils/vehicleNoCheck";

const TemporaryPermit = () => {
  const theme = getTheme();
  const vehicleDesign = getVehicleNumberDesign();
  const [permits, setPermits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false);
  const [showRenewPermitModal, setShowRenewPermitModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditPermitModal, setShowEditPermitModal] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);
  const [permitToRenew, setPermitToRenew] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [whatsappLoading, setWhatsappLoading] = useState(null); // Track which permit is loading
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'expiring_soon', 'expired', 'pending'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20,
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    pendingPaymentCount: 0,
    pendingPaymentAmount: 0,
  });

  // Fetch temporary permit statistics from API
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/temporary-permits/statistics`
      );
      if (response.data.success) {
        setStatistics({
          total: response.data.data.permits.total,
          active: response.data.data.permits.active,
          expiringSoon: response.data.data.permits.expiringSoon,
          expired: response.data.data.permits.expired,
          pendingPaymentCount: response.data.data.pendingPaymentCount,
          pendingPaymentAmount: response.data.data.pendingPaymentAmount,
        });
      }
    } catch (error) {
      console.error("Error fetching temporary permit statistics:", error);
    }
  };

  // Debounce search query to avoid losing focus on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch permits from backend on component mount and when filters change
  useEffect(() => {
    fetchPermits(1);
    fetchStatistics();
  }, [debouncedSearchQuery, statusFilter]);

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchPermits(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchPermits = async (page = pagination.currentPage) => {
    setLoading(true);
    setError(null);
    let url = `${API_URL}/api/temporary-permits`;
    const params = {
      page,
      limit: pagination.limit,
      search: debouncedSearchQuery,
    };

    if (statusFilter !== "all") {
      // Convert underscore to hyphen for API endpoints if needed, e.g., 'expiring_soon' -> 'expiring-soon'
      const filterPath = statusFilter.replace("_", "-");
      url = `${API_URL}/api/temporary-permits/${filterPath}`;
    }

    try {
      const response = await axios.get(url, { params });

      // Transform backend data to match frontend structure
      const transformedPermits = response.data.data.map((permit) => ({
        id: permit._id,
        _id: permit._id, // Keep _id for operations
        permitNumber: permit.permitNumber,
        vehicleType: permit.vehicleType,
        vehicleTypeFull:
          permit.vehicleType === "CV"
            ? "Commercial Vehicle"
            : "Passenger Vehicle",
        validityPeriod: permit.validityPeriod,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || "N/A",
        vehicleNumber: permit.vehicleNumber || "N/A",
        issueDate: permit.issueDate,
        validFrom: permit.validFrom,
        validTill: permit.validTo,
        status: permit.status,
        bill: permit.bill, // Include bill reference
        totalFee: permit.totalFee || 0,
        fees: permit.totalFee || 0,
        balance: permit.balance || 0,
        paid: permit.paid || 0,
        address: permit.address || "N/A",
        fatherName: permit.fatherName || "",
        email: permit.email || "",
        mobileNumber: permit.mobileNumber || "N/A",
        chassisNumber: permit.chassisNumber || "N/A",
        engineNumber: permit.engineNumber || "N/A",
        ladenWeight: permit.ladenWeight || "",
        unladenWeight: permit.unladenWeight || "",
        notes: permit.notes || "",
        route: permit.route || "N/A",
        isRenewed: permit.isRenewed || false, // IMPORTANT: Include isRenewed field
      }));

      setPermits(transformedPermits);

      // Update pagination state
      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalRecords: response.data.pagination.totalRecords,
          limit: pagination.limit,
        });
      }
    } catch (error) {
      console.error("Error fetching temporary permits:", error);
      toast.error(
        "Failed to fetch temporary permits. Please check if the backend server is running.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert DD-MM-YYYY to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // If it's already a valid date string (YYYY-MM-DD or ISO format)
    const standardDate = new Date(dateStr);
    if (!isNaN(standardDate.getTime())) {
      return standardDate;
    }

    // Try DD-MM-YYYY format
    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const parsedDate = new Date(year, month - 1, day);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    return null;
  };

  const handleViewBill = (permit) => {
    setSelectedPermit(permit);
    setShowBillModal(true);
  };

  const handleShare = (permit) => {
    setSelectedPermit(permit);
    setShowShareModal(true);
  };

  const handleWhatsAppShare = async (permit) => {
    // Set loading state
    setWhatsappLoading(permit.id);

    try {
      // Get phone number first (validate before API call)
      const phoneNumber = permit.mobileNumber?.replace(/\D/g, "") || "";

      if (!phoneNumber || phoneNumber.length < 10) {
        alert("No valid mobile number found for this permit holder");
        setWhatsappLoading(null);
        return;
      }

      // Generate bill PDF if needed
      let pdfUrl = null;

      if (permit.bill?.billPdfPath) {
        pdfUrl = `${API_URL}${permit.bill.billPdfPath}`;
      } else {
        const response = await axios.post(
          `${API_URL}/api/temporary-permits/${permit.id}/generate-bill-pdf`
        );
        if (!response.data.success) {
          throw new Error("Failed to generate bill PDF");
        }

        pdfUrl =
          response.data.data.pdfUrl ||
          `${API_URL}${response.data.data.pdfPath}`;
      }

      // Create WhatsApp message
      const message = `Hello ${permit.permitHolder || "Sir/Madam"},

Your Temporary Permit Bill is ready!

*Bill Number:* ${permit.bill?.billNumber || "N/A"}
*Permit Number:* ${permit.permitNumber}
*Vehicle Number:* ${permit.vehicleNo}
*Vehicle Type:* ${permit.vehicleTypeFull || permit.vehicleType}
*Total Fee:* ₹${permit.totalFee || permit.fees || 0}
*Valid From:* ${permit.validFrom}
*Valid Till:* ${permit.validTill}

You can view and download your bill from the link below:
${pdfUrl}

Thank you!`;

      const encodedMessage = encodeURIComponent(message);

      // Clear loading state
      setWhatsappLoading(null);

      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber}`;

      // Use WhatsApp Web for reliable message pre-fill (works for saved and unsaved contacts)
      const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;

      // Open in same tab named 'whatsapp_share' - reuses tab if already open
      const whatsappWindow = window.open(whatsappWebUrl, "whatsapp_share");
      if (whatsappWindow) {
        whatsappWindow.focus();
      } else {
        // If popup blocked, show message
        alert(
          "Please allow popups for this site to share via WhatsApp, or copy the link manually."
        );
      }
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      setWhatsappLoading(null);
      alert("Failed to prepare WhatsApp message. Please try again.");
    }
  };

  const handleEditClick = (permit) => {
    setEditingPermit(permit);
    setShowEditPermitModal(true);
  };

  const handleEditPermit = async (formData) => {
    try {
      // Prepare data to match backend model
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        fatherName: formData.fatherName || "",
        address: formData.address || "",
        mobileNumber: formData.mobileNumber || "",
        email: formData.email || "",
        chassisNumber: formData.chassisNumber || "",
        engineNumber: formData.engineNumber || "",
        ladenWeight: formData.ladenWeight ? Number(formData.ladenWeight) : 0,
        unladenWeight: formData.unladenWeight
          ? Number(formData.unladenWeight)
          : 0,
        totalFee: Number(formData.totalFee) || 1000,
        paid: Number(formData.paid) || 0,
        balance: Number(formData.balance) || 0,
      };

      // Make PUT request to backend to update the permit
      const response = await axios.put(
        `${API_URL}/api/temporary-permits/${editingPermit.id}`,
        permitData
      );
      // Show success message
      toast.success("Temporary Permit updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Close modal and refresh
      setShowEditPermitModal(false);
      setEditingPermit(null);
      await fetchPermits();
      await fetchStatistics();
    } catch (error) {
      if (error.response.data) {
        return toast.error(
          `${
            error.response.data.message ||
            "some error while updating temp permit"
          }`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
      console.error("Error updating temporary permit:", error);
      toast.error(`Failed to update temporary permit: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleRenewClick = (permit) => {
    setPermitToRenew(permit);
    setShowRenewPermitModal(true);
  };

  const handleRenewSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/temporary-permits/renew`, {
        oldPermitId: formData.oldPermitId,
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolder,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        totalFee: parseFloat(formData.totalFee),
        paid: parseFloat(formData.paid),
        balance: parseFloat(formData.balance),
        fatherName: formData.fatherName,
        address: formData.address,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        chassisNumber: formData.chassisNumber,
        engineNumber: formData.engineNumber,
        ladenWeight: formData.ladenWeight ? Number(formData.ladenWeight) : undefined,
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : undefined,
        notes: formData.notes
      });

      if (response.data.success) {
        toast.success("Temporary permit renewed successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setShowRenewPermitModal(false);
        setPermitToRenew(null);
        // Refresh the list and statistics from the server
        await fetchPermits();
        await fetchStatistics();
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error renewing temporary permit:", error);
      toast.error(
        error.response?.data?.message || "Failed to renew temporary permit.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermit = async (permit) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this temporary permit?\n\n` +
        `Permit Number: ${permit.permitNumber}\n` +
        `Vehicle Number: ${permit.vehicleNo}\n` +
        `Permit Holder: ${permit.permitHolder}\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      // Make DELETE request to backend
      const response = await axios.delete(
        `${API_URL}/api/temporary-permits/${permit.id}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete temporary permit"
        );
      }

      // Show success message
      toast.success("Temporary Permit deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refresh the permits list
      await fetchPermits();
    } catch (error) {
      console.error("Error deleting temporary permit:", error);
      toast.error(`Failed to delete temporary permit: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Determine if renew button should be shown for a permit
  const shouldShowRenewButton = (permit) => {
    // Simple logic: show renew button only if not renewed and status is expired or expiring_soon
    return !permit.isRenewed && (permit.status === "expired" || permit.status === "expiring_soon");
  };

  const handleIssuePermit = async (formData) => {
    try {
      // Prepare data to match backend model
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        issueDate: formData.validFrom,
        fatherName: formData.fatherName || "",
        address: formData.address || "",
        mobileNumber: formData.mobileNumber || "",
        email: formData.email || "",
        chassisNumber: formData.chassisNumber || "",
        engineNumber: formData.engineNumber || "",
        ladenWeight: formData.ladenWeight
          ? Number(formData.ladenWeight)
          : undefined,
        unladenWeight: formData.unladenWeight
          ? Number(formData.unladenWeight)
          : undefined,
        totalFee: Number(formData.totalFee) || 0,
        paid: Number(formData.paid) || 0,
        balance: Number(formData.balance) || 0,
        notes: formData.notes || "",
      };

      // Make POST request to backend
      const response = await axios.post(
        `${API_URL}/api/temporary-permits`,
        permitData
      );

      // Show success message
      toast.success("Temporary Permit added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refresh the permits list and statistics
      await fetchPermits();
      await fetchStatistics();
    } catch (error) {
      if (error.response.data) {
        return toast.error(
          `${
            error.response.data.message || "some error while adding temp permit"
          }`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
      toast.error(`Failed to create temporary permit`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8">
          {/* Statistics Cards */}
          <div className="mb-2 mt-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5">
              <StatisticsCard
                title="Total Temporary Permits"
                value={statistics.total}
                color="blue"
                isActive={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
                icon={
                  <svg
                    className="w-4 h-4 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
              <StatisticsCard
                title="Expiring Soon"
                value={statistics.expiringSoon}
                subtext="within 15days"
                color="orange"
                isActive={statusFilter === "expiring_soon"}
                onClick={() =>
                  setStatusFilter(
                    statusFilter === "expiring_soon" ? "all" : "expiring_soon"
                  )
                }
                icon={
                  <svg
                    className="w-4 h-4 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <StatisticsCard
                title="Expired"
                value={statistics.expired}
                subtext="expired permit"
                color="red"
                isActive={statusFilter === "expired"}
                onClick={() =>
                  setStatusFilter(
                    statusFilter === "expired" ? "all" : "expired"
                  )
                }
                icon={
                  <svg
                    className="w-4 h-4 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                }
              />
              <StatisticsCard
                title="Pending Payment"
                value={statistics.pendingPaymentCount}
                extraValue={`₹${statistics.pendingPaymentAmount.toLocaleString(
                  "en-IN"
                )}`}
                color="yellow"
                isActive={statusFilter === "pending"}
                onClick={() =>
                  setStatusFilter(
                    statusFilter === "pending" ? "all" : "pending"
                  )
                }
                icon={
                  <svg
                    className="w-4 h-4 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Permits Table */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Search and Filters Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-2 items-stretch lg:items-center">
                {/* Search Bar */}
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                  placeholder="Search by vehicle number..."
                  toUpperCase={true}
                />

                {/* New Permit Button */}
                <AddButton
                  onClick={() => setShowIssuePermitModal(true)}
                  title="New Temporary Permit"
                />
              </div>
            </div>

            {/* Mobile Card View */}
            <MobileCardView
              loading={loading}
              records={permits}
              emptyMessage={{
                title: 'No Temporary Permits Found',
                description: 'Get started by adding your first temporary permit.',
              }}
              loadingMessage='Loading permits...'
              headerGradient='from-indigo-50 via-purple-50 to-pink-50'
              avatarGradient='from-indigo-500 to-purple-500'
              emptyIconGradient='from-indigo-100 to-purple-100'
              emptyIconColor='text-indigo-400'
              cardConfig={{
                header: {
                  avatar: () => (
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  ),
                  title: (record) => record.permitNumber,
                  subtitle: (record) => record.permitHolder || '-',
                  showVehicleParts: false,
                },
                body: {
                  showStatus: true,
                  showPayment: true,
                  showValidity: true,
                  customFields: [
                    {
                      render: (record, { renderVehicleBadge, getStatusColor, getStatusText }) => (
                        <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100'>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                          {renderVehicleBadge(record.vehicleNo)}
                        </div>
                      ),
                    },
                  ],
                },
              }}
              actions={[
                {
                  title: 'Renew Permit',
                  condition: shouldShowRenewButton,
                  onClick: handleRenewClick,
                  bgColor: 'bg-blue-100',
                  textColor: 'text-blue-600',
                  hoverBgColor: 'bg-blue-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                  ),
                },
                {
                  title: 'Edit Permit',
                  onClick: handleEditClick,
                  bgColor: 'bg-amber-100',
                  textColor: 'text-amber-600',
                  hoverBgColor: 'bg-amber-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                    </svg>
                  ),
                },
                {
                  title: 'View Bill',
                  onClick: handleViewBill,
                  bgColor: 'bg-emerald-100',
                  textColor: 'text-emerald-600',
                  hoverBgColor: 'bg-emerald-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  ),
                },
                {
                  title: 'Share via WhatsApp',
                  onClick: handleWhatsAppShare,
                  loading: whatsappLoading,
                  bgColor: 'bg-green-100',
                  textColor: 'text-green-600',
                  hoverBgColor: 'bg-green-200',
                  icon: (
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                    </svg>
                  ),
                },
                {
                  title: 'Delete Permit',
                  onClick: handleDeletePermit,
                  bgColor: 'bg-red-100',
                  textColor: 'text-red-600',
                  hoverBgColor: 'bg-red-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    </svg>
                  ),
                },
              ]}
            />

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className={theme.tableHeader}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Vehicle/Permit No.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Permit Holder
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Valid From
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Valid Till
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Total Fee (₹)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Paid (₹)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Balance (₹)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-16">
                        <div className="flex flex-col justify-center items-center">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin"></div>
                          </div>
                          <p className="text-gray-600 mt-6">
                            Loading temporary permits...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : permits.length > 0 ? (
                    permits.map((permit) => (
                      <tr
                        key={permit.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            <div>
                              {(() => {
                                const parts = getVehicleNumberParts(
                                  permit.vehicleNo
                                );
                                if (!parts) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <svg
                                        className="w-4 h-4 text-blue-600 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                      </svg>
                                      <span className="text-[15px] font-semibold text-gray-900">
                                        {permit.vehicleNo}
                                      </span>
                                    </div>
                                  );
                                }
                                return (
                                  <div className={vehicleDesign.container}>
                                    <svg
                                      className="w-4 h-6 mr-0.5   text-blue-800 flex-shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                    </svg>
                                    <span className={vehicleDesign.stateCode}>
                                      {parts.stateCode}
                                    </span>
                                    <span className={vehicleDesign.districtCode}>
                                      {parts.districtCode}
                                    </span>
                                    <span className={vehicleDesign.series}>
                                      {parts.series}
                                    </span>
                                    <span className={vehicleDesign.last4Digits}>
                                      {parts.last4Digits}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-[13px] font-medium text-gray-600">
                                {permit.permitNumber}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {permit.permitHolder?.charAt(0) || "P"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {permit.permitHolder}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                {permit.mobileNumber || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-[13.8px]">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold border border-green-200">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {permit.validFrom}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-[13.8px]">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold border border-red-200">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {permit.validTill}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-gray-800">
                            ₹{(permit.totalFee || 0).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            ₹{(permit.paid || 0).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {(permit.balance || 0) > 0 ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                              ₹{(permit.balance || 0).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              ₹0
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(
                              permit.status
                            )}`}
                          >
                            {getStatusText(permit.status)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1">
                            {shouldShowRenewButton(permit) ? (
                              <button
                                onClick={() => handleRenewClick(permit)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                                title="Renew Permit"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <div className="w-9"></div>
                            )}
                            <button
                              onClick={() => handleEditClick(permit)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Edit Permit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleViewBill(permit)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="View Bill"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(permit)}
                              disabled={whatsappLoading === permit.id}
                              className={`p-2 rounded-lg transition-all group-hover:scale-110 duration-200 relative flex-shrink-0 ${
                                whatsappLoading === permit.id
                                  ? "text-gray-400 bg-gray-100 cursor-wait"
                                  : "text-green-600 hover:bg-green-100 cursor-pointer"
                              }`}
                              title={
                                whatsappLoading === permit.id
                                  ? "Loading..."
                                  : "Share via WhatsApp"
                              }
                            >
                              {whatsappLoading === permit.id ? (
                                <svg
                                  className="w-5 h-5 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeletePermit(permit)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                              title="Delete Permit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                            <svg
                              className="w-12 h-12 text-indigo-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-black text-gray-700 mb-2">
                            No Temporary Permits Found
                          </h3>
                          <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
                            {searchQuery
                              ? "No permits match your search criteria. Try adjusting your search terms."
                              : "Get started by adding your first temporary permit."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {permits.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalRecords={pagination.totalRecords}
                itemsPerPage={pagination.limit}
              />
            )}
          </div>

          {/* Add New Temporary Permit Modal - Lazy Loaded */}
          {showIssuePermitModal && (
            <Suspense fallback={null}>
              <IssueTemporaryPermitModal
                isOpen={showIssuePermitModal}
                onClose={() => setShowIssuePermitModal(false)}
                onSubmit={handleIssuePermit}
              />
            </Suspense>
          )}

          {/* Renew Temporary Permit Modal - Lazy Loaded */}
          {showRenewPermitModal && (
            <Suspense fallback={null}>
              <RenewTemporaryPermitModal
                isOpen={showRenewPermitModal}
                onClose={() => {
                  setShowRenewPermitModal(false);
                  setPermitToRenew(null);
                }}
                onSubmit={handleRenewSubmit}
                oldPermit={permitToRenew}
              />
            </Suspense>
          )}

          {/* Edit Temporary Permit Modal - Lazy Loaded */}
          {showEditPermitModal && (
            <Suspense fallback={null}>
              <EditTemporaryPermitModal
                isOpen={showEditPermitModal}
                onClose={() => {
                  setShowEditPermitModal(false);
                  setEditingPermit(null); // Clear editing data when closing
                }}
                onSubmit={handleEditPermit}
                permitData={editingPermit} // Pass permit data for editing
              />
            </Suspense>
          )}

          {/* Bill Modal - Lazy Loaded */}
          {showBillModal && selectedPermit && (
            <Suspense fallback={null}>
              <PermitBillModal
                permit={selectedPermit}
                onClose={() => {
                  setShowBillModal(false);
                  setSelectedPermit(null);
                }}
                permitType="Temporary"
              />
            </Suspense>
          )}

          {/* Share Modal - Lazy Loaded */}
          {showShareModal && selectedPermit && (
            <Suspense fallback={null}>
              <SharePermitModal
                permit={selectedPermit}
                onClose={() => {
                  setShowShareModal(false);
                  setSelectedPermit(null);
                }}
                permitType="Temporary"
              />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
};

export default TemporaryPermit;
