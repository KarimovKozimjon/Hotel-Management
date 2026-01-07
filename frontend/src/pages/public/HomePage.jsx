import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { getAmenityLabel, getRoomTypeDescription } from '../../utils/roomTypeLabel';
import { getRoomTypeLabel } from '../../utils/roomTypeLabel';
import api, { resolveAssetUrl } from '../../services/api';

function HomePage() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // Fetch room types from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log('🔄 Fetching room types from backend...');
        const response = await api.get('/public/room-types');
        const data = response?.data;
        console.log('✅ Fetched room types:', data);
        console.log('📊 Number of rooms:', data?.length || 0);
        
        if (data && data.length > 0) {
          // Map the data to ensure proper image URLs
          const mappedRooms = data.map(room => ({
            ...room,
            image: resolveAssetUrl(
              room.image?.startsWith('http')
                ? room.image
                : room.image
                  ? `/storage/${room.image}`
                  : room.image
            )
          }));
          console.log('🖼️ Rooms with proper image URLs:', mappedRooms);
          setRooms(mappedRooms);
        } else {
          console.warn('⚠️ No room types found, using fallback');
          // Use fallback if no rooms returned
          setRooms([
            {
              id: 1,
              name: t('home.roomsSection.standard'),
              price: 100,
              image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
              amenities: ["WiFi", "TV", "Air Conditioning"]
            },
            {
              id: 2,
              name: t('home.roomsSection.deluxe'),
              price: 200,
              image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
              amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony"]
            },
            {
              id: 3,
              name: t('home.roomsSection.presidential'),
              price: 350,
              image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
              amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Kitchen", "Jacuzzi"]
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
        // Fallback to default rooms if API fails
        setRooms([
          {
            id: 1,
            name: t('home.roomsSection.standard'),
            price: 100,
            image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
            amenities: ["WiFi", "TV", "Air Conditioning"]
          },
          {
            id: 2,
            name: t('home.roomsSection.deluxe'),
            price: 200,
            image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony"]
          },
          {
            id: 3,
            name: t('home.roomsSection.presidential'),
            price: 350,
            image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
            amenities: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Kitchen", "Jacuzzi"]
          }
        ]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();

    // Refetch when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchRooms();
      }
    };

    // Refetch when window gains focus
    const handleFocus = () => {
      fetchRooms();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [t]);

  // Handle contact form changes
  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      await api.post('/contact', contactForm);
        setSubmitMessage({ 
          type: 'success', 
          text: t('home.contact.form.successMessage') || 'Xabaringiz muvaffaqiyatli yuborildi!' 
        });
        setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);

      const serverMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : null);

      setSubmitMessage({ 
        type: 'error', 
        text: serverMessage || t('home.contact.form.errorMessage') || 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920",
      title: t('home.hero.slide1Title'),
      subtitle: t('home.hero.slide1Subtitle'),
      description: t('home.hero.slide1Desc')
    },
    {
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920",
      title: t('home.hero.slide2Title'),
      subtitle: t('home.hero.slide2Subtitle'),
      description: t('home.hero.slide2Desc')
    },
    {
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920",
      title: t('home.hero.slide3Title'),
      subtitle: t('home.hero.slide3Subtitle'),
      description: t('home.hero.slide3Desc')
    },
    {
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920",
      title: t('home.hero.slide4Title'),
      subtitle: t('home.hero.slide4Subtitle'),
      description: t('home.hero.slide4Desc')
    }
  ];
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };
  
  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-15.857 21.213 0" />
        </svg>
      ),
      title: t('home.services.wifi'),
      description: t('home.services.wifiDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      title: t('home.services.restaurant'),
      description: t('home.services.restaurantDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('home.services.fitness'),
      description: t('home.services.fitnessDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: t('home.services.spa'),
      description: t('home.services.spaDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: t('home.services.rooms'),
      description: t('home.services.roomsDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      title: t('home.services.stars'),
      description: t('home.services.starsDesc')
    }
  ];

  const galleryImages = [
    { id: 1, src: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800", title: t('home.gallery.pool') },
    { id: 2, src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", title: t('home.gallery.restaurant') },
    { id: 3, src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800", title: t('home.gallery.lobby') },
    { id: 4, src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800", title: t('home.gallery.relax') }
  ];
  
  return (
    <div>
      {/* Hero Carousel Section */}
      <section id="hero-section" className="relative h-screen overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade, Parallax]}
          effect="fade"
          speed={1500}
          parallax={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          loop={true}
          className="h-full w-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                {/* Background Image with Parallax */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  data-swiper-parallax="-23%"
                  style={{
                    backgroundImage: `url('${slide.image}')`,
                    filter: "brightness(0.65)"
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-white px-4 z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-center max-w-4xl"
                  >
                    <h1 
                      className="text-5xl md:text-7xl font-bold mb-6"
                      data-swiper-parallax="-300"
                    >
                      {slide.title}
                    </h1>
                    <p 
                      className="text-2xl md:text-3xl mb-4 font-light"
                      data-swiper-parallax="-200"
                    >
                      {slide.subtitle}
                    </p>
                    <p 
                      className="text-lg md:text-xl mb-12 text-gray-200"
                      data-swiper-parallax="-100"
                    >
                      {slide.description}
                    </p>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                      data-swiper-parallax="-50"
                    >
                      <a
                        href="#rooms"
                        className="px-8 py-4 bg-white text-indigo-700 rounded-lg font-bold hover:bg-gray-50 hover:scale-105 transform transition-all duration-300 text-center shadow-2xl border-2 border-white"
                      >
                        {t('home.viewRooms')}
                      </a>
                      <Link
                        to="/guest/login"
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-white text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transform transition-all duration-300 text-center shadow-2xl"
                      >
                        {t('home.bookNow')}
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-20 left-0 right-0 z-20">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-center bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 shadow-xl"
                      >
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>120+</div>
                        <div className="text-sm md:text-base text-white font-semibold drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{t('home.stats.rooms')}</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="text-center bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 shadow-xl"
                      >
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>5000+</div>
                        <div className="text-sm md:text-base text-white font-semibold drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{t('home.stats.clients')}</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="text-center bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 shadow-xl"
                      >
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>24/7</div>
                        <div className="text-sm md:text-base text-white font-semibold drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{t('home.stats.service')}</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="text-center bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 shadow-xl"
                      >
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>★ 5.0</div>
                        <div className="text-sm md:text-base text-white font-semibold drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{t('home.stats.rating')}</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Scroll Indicator */}
        <motion.a
          href="#services"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce cursor-pointer"
        >
          <div className="flex flex-col items-center text-white">
            <span className="text-sm mb-2">{t('home.hero.scrollDown')}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.a>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('home.about.title')}</h2>
              <p className="text-gray-600 text-lg mb-6">
                {t('home.about.text1')}
              </p>
              <p className="text-gray-600 text-lg mb-6">
                {t('home.about.text2')}
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-indigo-600 mb-2">120+</div>
                  <div className="text-gray-600">{t('home.about.stats.rooms')}</div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-indigo-600 mb-2">5000+</div>
                  <div className="text-gray-600">{t('home.about.stats.clients')}</div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
                  <div className="text-gray-600">{t('home.about.stats.staff')}</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
                  alt="Hotel Lobby"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover cursor-pointer"
                  onClick={() => {
                    setSelectedImage("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920");
                    setShowImageModal(true);
                  }}
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400"
                  alt="Hotel Room"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover mt-8 cursor-pointer"
                  onClick={() => {
                    setSelectedImage("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920");
                    setShowImageModal(true);
                  }}
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"
                  alt="Hotel Restaurant"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover -mt-8 cursor-pointer"
                  onClick={() => {
                    setSelectedImage("https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920");
                    setShowImageModal(true);
                  }}
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400"
                  alt="Hotel Pool"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover cursor-pointer"
                  onClick={() => {
                    setSelectedImage("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920");
                    setShowImageModal(true);
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.roomsSection.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.roomsSection.subtitle')}
            </p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loadingRooms ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-8 bg-gray-300 rounded mb-4"></div>
                    <div className="flex gap-2 mb-6">
                      <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                      <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-12 bg-gray-300 rounded-lg"></div>
                  </div>
                </div>
              ))
            ) : (
              rooms.map((room) => (
                <motion.div 
                  key={room.id}
                  variants={scaleIn}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      src={room.image} 
                      alt={getRoomTypeLabel(room.name, t)}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        setSelectedImage(room.image);
                        setShowImageModal(true);
                      }}
                    />
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="absolute top-4 right-4"
                    >
                      <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">${Math.floor(room.price)}</span>
                          <span className="text-sm text-gray-600">/{t('home.roomsSection.perNight')}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{getRoomTypeLabel(room.name, t)}</h3>
                    <p className="text-gray-600 mb-4">{getRoomTypeDescription(room, t)}</p>
                    <div className="flex flex-wrap gap-2 mb-6 flex-1">
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium h-fit"
                      >
                        {room.capacity} {t('home.roomsSection.guests')}
                      </motion.span>
                      {(() => {
                        const amenities = Array.isArray(room.amenities) ? room.amenities : [];
                        const maxAmenities = 4;
                        const visible = amenities.slice(0, maxAmenities);
                        const remaining = amenities.length - visible.length;

                        return (
                          <>
                            {visible.map((amenity, idx) => (
                        <motion.span 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium h-fit whitespace-nowrap"
                        >
                          {getAmenityLabel(amenity, t)}
                        </motion.span>
                            ))}

                            {remaining > 0 && (
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium h-fit whitespace-nowrap">
                                +{remaining}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <Link
                      to="/guest/login"
                      className="block w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transform transition-all duration-300 shadow-lg mt-auto"
                    >
                      {t('home.bookNow')}
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.services.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:shadow-lg"
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.gallery.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.gallery.subtitle')}
            </p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {galleryImages.map((image, index) => (
              <motion.div 
                key={image.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
                onClick={() => {
                  setSelectedImage(image.src);
                  setShowImageModal(true);
                }}
              >
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 w-full">
                    <h3 className="text-2xl font-bold text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {image.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.contact.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.contact.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('home.contact.form.title')}</h3>
              
              {submitMessage.text && (
                <div className={`mb-4 p-4 rounded-lg ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.contact.form.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={t('home.contact.form.namePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={t('home.contact.form.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={t('home.contact.form.phonePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('home.contact.form.message')}
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder={t('home.contact.form.messagePlaceholder')}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t('home.contact.form.sending') : t('home.contact.form.submit')}
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('home.contact.info.title')}</h3>
                <div className="space-y-6">
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('home.contact.info.address')}</h4>
                      <p className="text-gray-600">{t('home.contact.info.addressText')}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('home.contact.info.phone')}</h4>
                      <p className="text-gray-600">+998 90 123 45 67</p>
                      <p className="text-gray-600">+998 71 123 45 67</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('home.contact.info.email')}</h4>
                      <p className="text-gray-600">info@comforthub.uz</p>
                      <p className="text-gray-600">booking@comforthub.uz</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{t('home.contact.info.hours')}</h4>
                      <p className="text-gray-600">{t('home.contact.info.hoursText')}</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Map */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden h-64"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.5149819416305!2d69.24546731540562!3d41.31151797927062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5a9323b4aa5cb98!2sAmir%20Temur%20Square!5e0!3m2!1sen!2s!4v1640179848644!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Comfort Hub Location"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4"
          >
            {t('home.cta.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl mb-8 text-indigo-100"
          >
            {t('home.cta.subtitle')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              {t('home.cta.questions')}
            </a>
            <Link
              to="/guest/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 hover:scale-105 transform transition-all duration-300"
            >
              {t('home.cta.bookNow')}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Image Lightbox Modal */}
      {showImageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative max-w-7xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <img
              src={selectedImage}
              alt="Room"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default HomePage;
