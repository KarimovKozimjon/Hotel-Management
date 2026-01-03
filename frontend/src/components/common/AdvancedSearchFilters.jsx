import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function AdvancedSearchFilters({ filters, setFilters, onFilterChange, roomTypes = [], handleSearch }) {
  const { t } = useTranslation();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    if (typeof onFilterChange === 'function') {
      onFilterChange(filters);
    }
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

  const getSortLabel = (sortBy) => {
    if (!sortBy) return '';
    const map = {
      price_asc: t('filter.sortOptions.priceAsc') || 'Narx: Arzondan qimmatga',
      price_desc: t('filter.sortOptions.priceDesc') || 'Narx: Qimmatdan arzonga',
      capacity_asc: t('filter.sortOptions.capacityAsc') || "Sig'im: Kamdan ko'pga",
      capacity_desc: t('filter.sortOptions.capacityDesc') || "Sig'im: Ko'pdan kamga",
      floor: t('filter.sortOptions.floor') || "Qavat bo'yicha",
    };
    return map[sortBy] || sortBy;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      {/* Toggle Button for Mobile */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
          {t('filter.title') || 'Qidiruv filterlari'}
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
          {showFilters ? (t('filter.hideFilters') || 'Yashirish') : (t('filter.showFilters') || "Ko'rsatish")}
        </button>
      </div>


      {/* Filters (scrollsiz, responsiv) */}
      <div className="w-full mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          {/* Room Type Filter */}
          <div className="flex flex-col min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.roomType') || 'Xona turi'}</label>
          <select
            value={filters.room_type_id}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('room_type_id', val === '' ? '' : parseInt(val, 10));
            }}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.all') || 'Barchasi'}</option>
            {roomTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name} (${type.base_price})
              </option>
            ))}
          </select>
          </div>
          {/* Capacity Filter */}
          <div className="flex flex-col min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.minCapacity') || "Minimal sig'im"}</label>
          <select
            value={filters.min_capacity}
            onChange={(e) => handleChange('min_capacity', e.target.value)}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.any') || 'Har qanday'}</option>
            <option value="1">1+ {t('guest.bookRoomPage.people') || 'kishi'}</option>
            <option value="2">2+ {t('guest.bookRoomPage.people') || 'kishi'}</option>
            <option value="3">3+ {t('guest.bookRoomPage.people') || 'kishi'}</option>
            <option value="4">4+ {t('guest.bookRoomPage.people') || 'kishi'}</option>
            <option value="5">5+ {t('guest.bookRoomPage.people') || 'kishi'}</option>
          </select>
          </div>
          {/* Floor Filter */}
          <div className="flex flex-col min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('room.floor') || 'Qavat'}</label>
          <select
            value={filters.floor}
            onChange={(e) => handleChange('floor', e.target.value)}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.allFloors') || 'Barcha qavatlar'}</option>
            <option value="1">1-{t('guest.bookRoomPage.floorSuffix') || 'qavat'}</option>
            <option value="2">2-{t('guest.bookRoomPage.floorSuffix') || 'qavat'}</option>
            <option value="3">3-{t('guest.bookRoomPage.floorSuffix') || 'qavat'}</option>
            <option value="4">4-{t('guest.bookRoomPage.floorSuffix') || 'qavat'}</option>
            <option value="5">5-{t('guest.bookRoomPage.floorSuffix') || 'qavat'}</option>
          </select>
          </div>
          {/* Price Range */}
          <div className="flex flex-col min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.minPrice') || 'Min narx'}</label>
          <input
            type="number"
            placeholder={t('filter.minPrice') || 'Min narx'}
            value={filters.min_price}
            onChange={(e) => {
              handleChange('min_price', e.target.value);
              setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }));
            }}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
            min="0"
          />
          </div>
          <div className="flex flex-col min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.maxPrice') || 'Max narx'}</label>
          <input
            type="number"
            placeholder={t('filter.maxPrice') || 'Max narx'}
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
          <div className="flex flex-col min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1">{t('filter.sortBy') || 'Saralash'}</label>
          <select
            value={filters.sort_by}
            onChange={(e) => handleChange('sort_by', e.target.value)}
            className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm bg-white"
          >
            <option value="">{t('filter.defaultSort') || 'Standart'}</option>
            <option value="price_asc">{t('filter.sortOptions.priceAsc') || 'Narx: Arzondan qimmatga'}</option>
            <option value="price_desc">{t('filter.sortOptions.priceDesc') || 'Narx: Qimmatdan arzonga'}</option>
            <option value="capacity_asc">{t('filter.sortOptions.capacityAsc') || "Sig'im: Kamdan ko'pga"}</option>
            <option value="capacity_desc">{t('filter.sortOptions.capacityDesc') || "Sig'im: Ko'pdan kamga"}</option>
            <option value="floor">{t('filter.sortOptions.floor') || "Qavat bo'yicha"}</option>
          </select>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col min-w-0 gap-2">
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold text-sm mb-1"
          >
            {t('common.clear') || 'Tozalash'}
          </button>
            <button
              onClick={handleApply}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold text-sm"
            >
              {t('common.apply') || "Qo'llash"}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.room_type_id && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.roomType') || 'Xona turi'}: {roomTypes.find(rt => rt.id == filters.room_type_id)?.name}
              </span>
            )}
            {filters.min_price && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.minPrice') || 'Min'}: ${filters.min_price}
              </span>
            )}
            {filters.max_price && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.maxPrice') || 'Max'}: ${filters.max_price}
              </span>
            )}
            {filters.min_capacity && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                {filters.min_capacity}+ {t('guest.bookRoomPage.people') || 'kishi'}
              </span>
            )}
            {filters.floor && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                {filters.floor}-{t('guest.bookRoomPage.floorSuffix') || 'qavat'}
              </span>
            )}
            {filters.sort_by && (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                {t('filter.sortBy') || 'Saralash'}: {getSortLabel(filters.sort_by)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchFilters;
