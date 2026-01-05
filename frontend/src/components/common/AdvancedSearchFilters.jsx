import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoomTypeLabel } from '../../utils/roomTypeLabel';

function AdvancedSearchFilters({ filters, setFilters, onFilterChange, roomTypes = [], handleSearch }) {
  const { t, i18n } = useTranslation();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);

  const formatUsd = (value) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD'
    }).format(Number(value || 0));

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFilterChange(filters);
    setShowFilters(false);
    if (typeof handleSearch === 'function') {
      handleSearch();
    }
  };

  const handleReset = () => {
    const resetFilters = {
      room_type_id: '',
      min_price: '',
      max_price: '',
      min_capacity: '',
      floor: '',
      sort_by: '',
    };
    setFilters(resetFilters);
    setPriceRange({ min: 0, max: 1000 });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      {/* Toggle Button for Mobile */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
          🔍 {t('filter.title')}
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          {showFilters ? t('filter.hideFilters') : t('filter.showFilters')}
        </button>
      </div>


      {/* Zamonaviy gorizontal filterlar */}
      <div
        className={`w-full ${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-4 items-end justify-start mb-4`}
      >
        {/* Room Type Filter */}
        <div className="flex flex-col w-full sm:w-auto sm:min-w-[180px]">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.roomType')}</label>
          <select
            value={filters.room_type_id}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('room_type_id', val === '' ? '' : parseInt(val, 10));
            }}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.all')}</option>
            {roomTypes.map(type => (
              <option key={type.id} value={type.id}>
                {getRoomTypeLabel(type, t)} ({formatUsd(type.base_price)})
              </option>
            ))}
          </select>
        </div>
        {/* Capacity Filter */}
        <div className="flex flex-col w-full sm:w-auto sm:min-w-[140px]">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.minCapacity')}</label>
          <select
            value={filters.min_capacity}
            onChange={(e) => handleChange('min_capacity', e.target.value)}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.any')}</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={String(value)}>
                {t('filter.capacityOption', { value })}
              </option>
            ))}
          </select>
        </div>
        {/* Floor Filter */}
        <div className="flex flex-col w-full sm:w-auto sm:min-w-[120px]">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('room.floor')}</label>
          <select
            value={filters.floor}
            onChange={(e) => handleChange('floor', e.target.value)}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.allFloors')}</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={String(value)}>
                {t('filter.floorOption', { value })}
              </option>
            ))}
          </select>
        </div>
        {/* Price Range */}
        <div className="flex flex-col w-full sm:w-auto sm:min-w-[120px]">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.minPrice')}</label>
          <input
            type="number"
            placeholder={t('filter.minPrice')}
            value={filters.min_price}
            onChange={(e) => {
              handleChange('min_price', e.target.value);
              setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }));
            }}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
            min="0"
          />
        </div>
        <div className="flex flex-col w-full sm:w-auto sm:min-w-[120px]">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.maxPrice')}</label>
          <input
            type="number"
            placeholder={t('filter.maxPrice')}
            value={filters.max_price}
            onChange={(e) => {
              handleChange('max_price', e.target.value);
              setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000 }));
            }}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
            min="0"
          />
        </div>
        {/* Sort By */}
        <div className="flex flex-col w-full sm:w-auto sm:min-w-[140px]">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.sortBy')}</label>
          <select
            value={filters.sort_by}
            onChange={(e) => handleChange('sort_by', e.target.value)}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.sortOptions.default')}</option>
            <option value="price_asc">💰 {t('filter.sortOptions.priceAsc')}</option>
            <option value="price_desc">💰 {t('filter.sortOptions.priceDesc')}</option>
            <option value="capacity_asc">👥 {t('filter.sortOptions.capacityAsc')}</option>
            <option value="capacity_desc">👥 {t('filter.sortOptions.capacityDesc')}</option>
            <option value="floor">🏢 {t('filter.sortOptions.floor')}</option>
          </select>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col w-full sm:w-auto sm:min-w-[120px] gap-2">
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold text-sm mb-1"
          >
            🔄 {t('common.reset')}
          </button>
          <button
            onClick={handleApply}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold text-sm"
          >
            ✓ {t('common.apply')}
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.room_type_id && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.roomType')}: {getRoomTypeLabel(roomTypes.find(rt => rt.id == filters.room_type_id), t)}
              </span>
            )}
            {filters.min_price && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.minPrice')}: {formatUsd(filters.min_price)}
              </span>
            )}
            {filters.max_price && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.maxPrice')}: {formatUsd(filters.max_price)}
              </span>
            )}
            {filters.min_capacity && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.capacityOption', { value: Number(filters.min_capacity) })}
              </span>
            )}
            {filters.floor && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.floorOption', { value: Number(filters.floor) })}
              </span>
            )}
            {filters.sort_by && (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.sortBy')}: {filters.sort_by}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchFilters;
