import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import StatisticsCard from '../../components/StatisticsCard';
import DashboardModuleSection from './components/DashboardModuleSection';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Dashboard2 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    fitness: { total: 0, expiringSoon: 0 },
    tax: { total: 0, expiring: 0 },
    puc: { total: 0, expiringSoon: 0 },
    gps: { total: 0, expiringSoon: 0 },
    busPermit: { total: 0, expiringSoon: 0 },
    nationalPermit: { total: 0, partAExpiringSoon: 0, partBExpiringSoon: 0 },
  });
  const [expiringRecords, setExpiringRecords] = useState({
    fitness: [],
    tax: [],
    puc: [],
    gps: [],
    busPermit: [],
    nationalPermit: [],
  });

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard`, { withCredentials: true });
      const data = response.data.data;

      setStatistics(data.statistics || {
        fitness: { total: 0, expiringSoon: 0 },
        tax: { total: 0, expiring: 0 },
        puc: { total: 0, expiringSoon: 0 },
        gps: { total: 0, expiringSoon: 0 },
        busPermit: { total: 0, expiringSoon: 0 },
        nationalPermit: { total: 0, partAExpiringSoon: 0, partBExpiringSoon: 0 },
      });

      setExpiringRecords(data.expiringRecords || {
        fitness: [],
        tax: [],
        puc: [],
        gps: [],
        busPermit: [],
        nationalPermit: [],
      });

      if (isRefresh) {
        toast.success('Dashboard refreshed successfully!');
      }
    } catch (error) {
      console.error('Dashboard2 fetch error:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard 2</h1>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-300 h-48 rounded-lg"></div>
              <div className="bg-gray-300 h-48 rounded-lg"></div>
              <div className="bg-gray-300 h-48 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard 2</h1>

        {/* Fitness Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Fitness Overview</h2>
          <div className="mb-6 max-w-sm"> {/* Wrap card in a div for layout control, e.g., max-width */}
            <StatisticsCard
              title="Expiring Soon"
              value={statistics.fitness.expiringSoon}
              color="red"
              icon={<span>✅</span>}
              onClick={() => navigate('/fitness')}
            />
          </div>
          <DashboardModuleSection
            title="Fitness Certificates Expiring"
            icon="✅"
            color="red"
            records={expiringRecords.fitness}
            viewAllLink="/fitness"
            emptyMessage="No fitness certificates expiring in the next 30 days"
          />
        </div>

        {/* Tax Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatisticsCard
              title="Total Tax Records"
              value={statistics.tax.total}
              color="yellow"
              icon={<span>💰</span>}
              onClick={() => navigate('/tax')}
            />
            <StatisticsCard
              title="Expiring Soon"
              value={statistics.tax.expiring}
              color="red"
              icon={<span>⏳</span>}
              onClick={() => navigate('/tax')}
            />
          </div>
          <DashboardModuleSection
            title="Tax Certificates"
            icon="💰"
            color="yellow"
            records={expiringRecords.tax}
            viewAllLink="/tax"
            emptyMessage="No tax certificates expiring in the next 15 days"
          />
        </div>

        {/* PUC Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatisticsCard
              title="Total PUC Records"
              value={statistics.puc.total}
              color="teal"
              icon={<span>🌿</span>}
              onClick={() => navigate('/puc')}
            />
            <StatisticsCard
              title="Expiring Soon"
              value={statistics.puc.expiringSoon}
              color="red"
              icon={<span>⏳</span>}
              onClick={() => navigate('/puc')}
            />
          </div>
          <DashboardModuleSection
            title="PUC Certificates"
            icon="💨"
            color="teal"
            records={expiringRecords.puc}
            viewAllLink="/puc"
            emptyMessage="No PUC certificates expiring in the next 30 days"
          />
        </div>

        {/* GPS Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatisticsCard
              title="Total GPS Records"
              value={statistics.gps.total}
              color="purple"
              icon={<span>🛰️</span>}
              onClick={() => navigate('/gps')}
            />
            <StatisticsCard
              title="Expiring Soon"
              value={statistics.gps.expiringSoon}
              color="red"
              icon={<span>⏳</span>}
              onClick={() => navigate('/gps')}
            />
          </div>
          <DashboardModuleSection
            title="GPS Devices"
            icon="📍"
            color="purple"
            records={expiringRecords.gps}
            viewAllLink="/gps"
            emptyMessage="No GPS devices expiring in the next 30 days"
          />
        </div>

        {/* Bus Permit Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatisticsCard
              title="Total Bus Permits"
              value={statistics.busPermit.total}
              color="orange"
              icon={<span>🚌</span>}
              onClick={() => navigate('/bus-permit')}
            />
            <StatisticsCard
              title="Expiring Soon"
              value={statistics.busPermit.expiringSoon}
              color="red"
              icon={<span>⏳</span>}
              onClick={() => navigate('/bus-permit')}
            />
          </div>
          <DashboardModuleSection
            title="Bus Permits"
            icon="🚌"
            color="orange"
            records={expiringRecords.busPermit}
            viewAllLink="/bus-permit"
            emptyMessage="No bus permits expiring in the next 30 days"
          />
        </div>

        {/* National Permit Section */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatisticsCard
              title="Total National Permits"
              value={statistics.nationalPermit.total}
              color="indigo"
              icon={<span>🛣️</span>}
              onClick={() => navigate('/national-permit')}
            />
            <StatisticsCard
              title="Part A Expiring"
              value={statistics.nationalPermit.partAExpiringSoon}
              color="red"
              icon={<span>⏳</span>}
              onClick={() => navigate('/national-permit')}
            />
            <StatisticsCard
              title="Part B Expiring"
              value={statistics.nationalPermit.partBExpiringSoon}
              color="red"
              icon={<span>⏳</span>}
              onClick={() => navigate('/national-permit')}
            />
          </div>
          <DashboardModuleSection
            title="National Permits"
            icon="🛣️"
            color="indigo"
            records={expiringRecords.nationalPermit}
            viewAllLink="/national-permit"
            emptyMessage="No national permits expiring in the next 30 days"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard2;
