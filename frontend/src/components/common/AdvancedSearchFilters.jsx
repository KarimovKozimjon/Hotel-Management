import { useState, useEffect } from 'react';

function AdvancedSearchFilters({ onFilterChange, roomTypes = [] }) {
  const [filters, setFilters] = useState({
    room_type_id: '',
    min_price: '',
    max_price: '',
    min_capacity: '',
    floor: '',
    sort_by: '',
  });

  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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
          🔍 Qidiruv filterlari
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
          {showFilters ? 'Yashirish' : 'Ko\'rsatish'}
        </button>
      </div>

      {/* Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Room Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xona turi
            </label>
            <select
              value={filters.room_type_id}
              onChange={(e) => handleChange('room_type_id', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barchasi</option>
              {roomTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} (${type.base_price})
                </option>
              ))}
            </select>
          </div>

          {/* Capacity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimal sig'im
            </label>
            <select
              value={filters.min_capacity}
              onChange={(e) => handleChange('min_capacity', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Har qanday</option>
              <option value="1">1+ kishi</option>
              <option value="2">2+ kishi</option>
              <option value="3">3+ kishi</option>
              <option value="4">4+ kishi</option>
              <option value="5">5+ kishi</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qavat
            </label>
            <select
              value={filters.floor}
              onChange={(e) => handleChange('floor', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barcha qavatlar</option>
              <option value="1">1-qavat</option>
              <option value="2">2-qavat</option>
              <option value="3">3-qavat</option>
              <option value="4">4-qavat</option>
              <option value="5">5-qavat</option>
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Narx oralig'i: ${priceRange.min} - ${priceRange.max}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder="Min narx"
                value={filters.min_price}
                onChange={(e) => {
                  handleChange('min_price', e.target.value);
                  setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max narx"
                value={filters.max_price}
                onChange={(e) => {
                  handleChange('max_price', e.target.value);
                  setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saralash
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => handleChange('sort_by', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Standart</option>
            <option value="price_asc">💰 Narx: Arzondan qimmmatga</option>
            <option value="price_desc">💰 Narx: Qimmatdan arzonga</option>
            <option value="capacity_asc">👥 Sig'im: Kamdan ko'pga</option>
            <option value="capacity_desc">👥 Sig'im: Ko'pdan kamga</option>
            <option value="floor">🏢 Qavat bo'yicha</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold text-sm sm:text-base"
          >
            🔄 Tozalash
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="flex-1 lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base"
          >
            ✓ Qo'llash
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.room_type_id && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                Xona turi: {roomTypes.find(t => t.id == filters.room_type_id)?.name}
              </span>
            )}
            {filters.min_price && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                Min: ${filters.min_price}
              </span>
            )}
            {filters.max_price && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                Max: ${filters.max_price}
              </span>
            )}
            {filters.min_capacity && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                {filters.min_capacity}+ kishi
              </span>
            )}
            {filters.floor && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                {filters.floor}-qavat
              </span>
            )}
            {filters.sort_by && (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                Saralash: {filters.sort_by}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchFilters;
