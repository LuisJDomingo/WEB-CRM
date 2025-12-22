import { useState, useEffect } from 'react';
import { Lock, Download, ChevronLeft, ChevronRight, Maximize2, X, Heart, MessageSquare, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useRoute } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivateGallery() {
  const [, params] = useRoute('/gallery/:token');
  const token = params?.token;
  const { isAuthenticated: isAdminAuthenticated, isLoading: isAdminAuthLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gallery, setGallery] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [isChronicleExpanded, setIsChronicleExpanded] = useState(false);
  const [comments, setComments] = useState('');

  // Cargar likes desde localStorage
  useEffect(() => {
    if (token) {
      const saved = localStorage.getItem(`likes_${token}`);
      if (saved) {
        try {
          setLikedImages(new Set(JSON.parse(saved)));
        } catch (e) { console.error(e); }
      }
    }
  }, [token]);

  const toggleLike = (url: string) => {
    const next = new Set(likedImages);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setLikedImages(next);
    localStorage.setItem(`likes_${token}`, JSON.stringify(Array.from(next)));
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  const handleSaveComments = async () => {
    if (!token) return;
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${baseUrl}/api/gallery/${token}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments }),
      });
      toast.success('Comentarios enviados al fotógrafo', {
        description: '¡Gracias por tu feedback! Lo hemos recibido correctamente.',
      });
    } catch (error) {
      toast.error('Error al guardar comentarios');
    }
  };

  // Cargar detalles de galería
  useEffect(() => {
    if (token) {
      fetchGalleryDetails();
    }
  }, [token]);

  // Bypass de contraseña para administradores
  useEffect(() => {
    // Si la autenticación de admin ha terminado, el admin está logueado, y tenemos datos de la galería
    if (!isAdminAuthLoading && isAdminAuthenticated && gallery) {
      setIsAuthenticated(true);
    }
  }, [isAdminAuthenticated, isAdminAuthLoading, gallery]);

  const fetchGalleryDetails = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/gallery/${token}`);
      if (response.ok) {
        const data = await response.json();
        setGallery(data.gallery);
        // Si ya tiene imágenes, cargarlas
        if (data.gallery?.images && data.gallery.images.length > 0) {
          setImages(data.gallery.images);
        }
        // Cargar comentarios del servidor si existen
        if (data.gallery?.client_comments) {
          setComments(data.gallery.client_comments);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/gallery/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Contraseña incorrecta');
        return;
      }

      setIsAuthenticated(true);
      toast.success('¡Acceso concedido!');
    } catch (error) {
      toast.error('Error al verificar contraseña');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (image: any): string => {
    return typeof image === 'string' ? image : (image?.url || '');
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
  };

  const closeFullscreen = () => {
    setFullscreenIndex(null);
  };

  const goToPrevious = () => {
    if (fullscreenIndex !== null && fullscreenIndex > 0) {
      setFullscreenIndex(fullscreenIndex - 1);
    }
  };

  const goToNext = () => {
    if (fullscreenIndex !== null && fullscreenIndex < filteredImages.length - 1) {
      setFullscreenIndex(fullscreenIndex + 1);
    }
  };

  // Manejar teclas del teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') closeFullscreen();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fullscreenIndex, images.length, showFavorites, likedImages]);

  const filteredImages = showFavorites 
    ? images.filter(img => likedImages.has(getImageUrl(img))) 
    : images;

  if (!token) {
    return (
      <main style={{ background: '#0d0d0d', color: '#f2f2f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#b3b3b3' }}>Galería no encontrada</p>
        </div>
      </main>
    );
  }

  if (isAdminAuthLoading) {
    return <main style={{ background: '#0d0d0d', color: '#f2f2f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Verificando sesión...</p></main>;
  }

  if (!isAuthenticated) {
    return (
      <main style={{ background: '#0d0d0d', color: '#f2f2f2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '128px' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Lock size={48} style={{ margin: '0 auto', color: '#d4af37', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Galería Privada</h1>
            <p style={{ color: '#b3b3b3' }}>
              {gallery?.client_name && `Galería de ${gallery.client_name}`}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#f2f2f2',
                  fontSize: '14px',
                  outline: 'none',
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#d4af37',
                color: '#0d0d0d',
                padding: '12px',
                borderRadius: '4px',
                fontWeight: 'bold',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '16px' }}>
            Usa la contraseña que te enviamos por email
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="lg:pr-[320px]" style={{ background: '#0d0d0d', color: '#f2f2f2', minHeight: '100vh', paddingTop: '128px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', color: '#d4af37', marginBottom: '8px', fontStyle: 'italic' }}>
              ¡Hola {gallery?.client_name}!
            </h2>

            <p style={{ color: '#b3b3b3', fontSize: '16px' }}> Bienvenido a tu galería privada. Aqui puedes ver todas las fotos de tu evento.</p>
            <p style={{ color: '#b3b3b3', fontSize: '12px' }}>Selecciona tus fotos favoritas haciendo clic en el ícono de corazón ❤️.</p>

            <p style={{ color: '#b3b3b3' }}>Reportaje realizado el {new Date(gallery?.event_date).toLocaleDateString('es-ES')}</p>

            {/* Crónica del Evento */}
            {gallery?.chronicle && (
              <div style={{ marginTop: '40px', marginBottom: '20px', maxWidth: '800px' }}>
                <h3 style={{ 
                  fontFamily: '"Playfair Display", serif', 
                  fontSize: '28px', 
                  color: '#d4af37', 
                  marginBottom: '20px',
                  borderBottom: '1px solid #333',
                  paddingBottom: '10px'
                }}>
                  Nuestra Crónica
                </h3>
                <div style={{ 
                  color: '#e5e5e5', 
                  fontSize: '16px', 
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                  fontFamily: '"Nunito", sans-serif',
                  transition: 'max-height 0.5s ease-in-out'
                }}>
                  {isChronicleExpanded || gallery.chronicle.length <= 200
                    ? gallery.chronicle
                    : `${gallery.chronicle.substring(0, 200)}...`}
                </div>
                {gallery.chronicle.length > 200 && (
                  <button
                    onClick={() => setIsChronicleExpanded(!isChronicleExpanded)}
                    style={{
                      marginTop: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#d4af37',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {isChronicleExpanded ? 'Leer menos' : 'Leer más'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Galería de imágenes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredImages.length > 0 ? (
            filteredImages.map((image, index) => {
              // Manejar tanto strings como objetos
              const imageUrl = typeof image === 'string' ? image : (image?.url || '');
              const imageTitle = typeof image === 'string' ? `Foto ${index + 1}` : (image?.originalName || `Foto ${index + 1}`);
              const isLiked = likedImages.has(imageUrl);
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '1',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={imageTitle}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                    }}
                    onClick={() => openFullscreen(index)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '8px',
                      padding: '12px',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(imageUrl);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: isLiked ? '#e56d61' : 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Heart size={20} fill={isLiked ? "white" : "none"} color="white" />
                    </button>
                    <button
                      onClick={() => openFullscreen(index)}
                      style={{
                        flex: 1,
                        backgroundColor: '#d4af37',
                        color: '#0d0d0d',
                        padding: '8px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontWeight: 'bold',
                      }}
                    >
                      <Maximize2 size={16} />
                      Ver
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>No hay imágenes disponibles en esta galería</p>
            </div>
          )}
        </div>

        {/* Sidebar de Favoritos */}
        <div className="hidden lg:flex" style={{
          position: 'fixed',
          right: '93px',
          top: '140px',
          width: '280px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
          zIndex: 40,
          flexDirection: 'column',
          gap: '16px',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto'
        }}>
          <h3 style={{fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f2f2f2'}}>
            <Heart size={20} fill="#e56d61" color="#e56d61" />
            Mis Favoritas
          </h3>
          
          <div style={{fontSize: '14px', color: '#b3b3b3'}}>
            Has seleccionado <strong style={{color: '#f2f2f2'}}>{likedImages.size}</strong> fotos
          </div>

          <button 
            onClick={() => setShowFavorites(!showFavorites)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: showFavorites ? '#d4af37' : '#333',
              color: showFavorites ? '#0d0d0d' : '#f2f2f2',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {showFavorites ? 'Ver Todas las Fotos' : 'Ver Solo Favoritas'}
          </button>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px'}}>
            {Array.from(likedImages).map((url, i) => (
              <div key={i} style={{aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333'}}>
                <img src={url} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
            ))}
            {likedImages.size === 0 && (
              <div style={{gridColumn: '1 / -1', textAlign: 'center', fontSize: '12px', color: '#666', padding: '20px 0'}}>
                No tienes favoritas aún
              </div>
            )}
          </div>

          {/* Sección de Comentarios */}
          <div style={{borderTop: '1px solid #333', paddingTop: '16px', marginTop: '16px'}}>
            <h4 style={{fontWeight: 'bold', fontSize: '14px', color: '#f2f2f2', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <MessageSquare size={16} /> Comentarios
            </h4>
            <textarea
              value={comments}
              onChange={handleCommentsChange}
              placeholder="Escribe aquí tus comentarios, por ejemplo, qué fotos te gustan para el álbum, si necesitas algún retoque, etc. Tambien aceptamos reseñas por aqui 😊"
              style={{
                width: '100%',
                minHeight: '120px',
                backgroundColor: '#0d0d0d',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '10px',
                color: '#f2f2f2',
                fontSize: '13px',
                resize: 'vertical'
              }}
            />
            <button
              onClick={handleSaveComments}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '10px',
                backgroundColor: '#d4af37',
                color: '#0d0d0d',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} /> Enviar al Fotógrafo
            </button>
          </div>
        </div>

        {/* Modal Pantalla Completa */}
        {fullscreenIndex !== null && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={closeFullscreen}
          >
            {/* Imagen */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageUrl(filteredImages[fullscreenIndex])}
                alt={`Foto ${fullscreenIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Botón Cerrar */}
              <button
                onClick={closeFullscreen}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: '#d4af37',
                  color: '#0d0d0d',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                <X size={24} />
              </button>

              {/* Botón Like Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(getImageUrl(filteredImages[fullscreenIndex]));
                }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '80px',
                  backgroundColor: likedImages.has(getImageUrl(filteredImages[fullscreenIndex])) ? '#e56d61' : 'rgba(255,255,255,0.1)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={24} fill="white" color="white" />
              </button>

              {/* Botón Anterior */}
              {fullscreenIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    color: '#0d0d0d',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d4af37')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.8)')}
                >
                  <ChevronLeft size={32} />
                </button>
              )}

              {/* Botón Siguiente */}
              {fullscreenIndex < filteredImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    color: '#0d0d0d',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d4af37')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.8)')}
                >
                  <ChevronRight size={32} />
                </button>
              )}

              {/* Indicador de posición */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#d4af37',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                {fullscreenIndex + 1} de {filteredImages.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
