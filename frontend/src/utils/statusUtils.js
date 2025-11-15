export const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-700';
  switch (status) {
    case 'expired':
      return 'bg-red-100 text-red-700';
    case 'expiring_soon':
      return 'bg-orange-100 text-orange-700';
    case 'active':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getStatusText = (status) => {
  if (!status) return 'Unknown';
  switch (status) {
    case 'expired':
      return 'Expired';
    case 'expiring_soon':
      return 'Expiring Soon';
    case 'active':
      return 'Active';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};
