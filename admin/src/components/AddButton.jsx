const AddButton = ({ onClick, title }) => {
  return (
    <button
      onClick={onClick}
      className='px-4 lg:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer'
    >
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
      </svg>
      <span className='hidden lg:inline'>{title}</span>
      <span className='lg:hidden'>Add New</span>
    </button>
  );
};

export default AddButton;
