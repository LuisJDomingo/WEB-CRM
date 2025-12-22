import { useState, useEffect } from 'react';
import {
  Trash2,
  Edit2,
  Copy,
  Check,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface GalleryItem {
  id: string;
  client_name: string;
  client_email: string;
  event_date: string;
  access_token: string;
  images: any[];
  created_at: string;
  expires_at: string;
  notes?: string;
  client_comments?: string;
}

export default function GalleryDashboard() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<GalleryItem>>({});
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageToDelete, setImageToDelete] = useState<{ token: string; url: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Cargar galerías
  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/galleries');
      const data = await response.json();

      if (data.success) {
        setGalleries(data.galleries);
      } else {
        toast.error('Error al cargar galerías');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (gallery: GalleryItem) => {
    setEditingId(gallery.id);
    setEditData({
      client_name: gallery.client_name,
      client_email: gallery.client_email,
      notes: gallery.notes,
    });
  };

  const handleSaveEdit = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/gallery/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (data.success) {
        setGalleries(galleries.map(g => (g.id === editingId ? data.gallery : g)));
        setEditingId(null);
        toast.success('Galería actualizada');
      } else {
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar galería');
    }
  };

  const handleAddImages = async (token: string) => {
    if (!selectedFile) {
      toast.error('Selecciona una imagen');
      return;
    }

    try {
      setUploadingId(token);
      const formData = new FormData();
      formData.append('images', selectedFile);
      formData.append('action', 'add');

      const response = await fetch(`http://localhost:3001/api/admin/gallery/${token}/images`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setGalleries(galleries.map(g => (g.access_token === token ? data.gallery : g)));
        setSelectedFile(null);
        toast.success('Imagen agregada');
      } else {
        toast.error(data.error || 'Error al agregar imagen');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al agregar imagen');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteImage = async (token: string, imageUrl: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/gallery/${token}/image`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();
      if (data.success) {
        setGalleries(galleries.map(g => (g.access_token === token ? data.gallery : g)));
        setImageToDelete(null);
        toast.success('Imagen eliminada');
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar imagen');
    }
  };

  const handleDeleteGallery = async (token: string) => {
    if (!confirm('¿Eliminar esta galería? No se puede deshacer.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/gallery/${token}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setGalleries(galleries.filter(g => g.access_token !== token));
        toast.success('Galería eliminada');
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar galería');
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    toast.success('Copiado');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getImageUrl = (img: any) => {
    if (typeof img === 'string') return img;
    return img.url || '';
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#b3b3b3' }}>Cargando galerías...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Panel de Galerías
        </h2>
        <p style={{ color: '#b3b3b3' }}>
          {galleries.length} galería{galleries.length !== 1 ? 's' : ''} activa{galleries.length !== 1 ? 's' : ''}
        </p>
      </div>

      {galleries.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            border: '2px dashed #d4af37',
            borderRadius: '8px',
          }}
        >
          <ImageIcon size={40} style={{ margin: '0 auto', color: '#d4af37', marginBottom: '16px' }} />
          <p style={{ color: '#b3b3b3' }}>No hay galerías creadas</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {galleries.map(gallery => (
            <div
              key={gallery.id}
              style={{
                border: '1px solid #333',
                borderRadius: '8px',
                backgroundColor: '#1a1a1a',
                overflow: 'hidden',
              }}
            >
              {/* Header de galería */}
              <div
                style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#1a1a1a',
                }}
                onClick={() =>
                  setExpandedId(expandedId === gallery.id ? null : gallery.id)
                }
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {editingId === gallery.id ? (
                      <input
                        type="text"
                        value={editData.client_name || ''}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            client_name: e.target.value,
                          })
                        }
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding: '6px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #d4af37',
                          color: '#f2f2f2',
                          borderRadius: '4px',
                          width: '100%',
                        }}
                      />
                    ) : (
                      gallery.client_name
                    )}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#b3b3b3' }}>
                    {gallery.client_email}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#d4af37',
                      backgroundColor: '#2a2a2a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {gallery.images?.length || 0} fotos
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {editingId === gallery.id ? (
                      <>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleSaveEdit(gallery.access_token);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#d4af37',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px',
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#333',
                            color: '#f2f2f2',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEdit(gallery);
                          }}
                          style={{
                            padding: '6px',
                            backgroundColor: '#333',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color: '#f2f2f2',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                          }}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteGallery(gallery.access_token);
                          }}
                          style={{
                            padding: '6px',
                            backgroundColor: '#ff4444',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'center',
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>

                  {expandedId === gallery.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {/* Contenido expandido */}
              {expandedId === gallery.id && (
                <div style={{ borderTop: '1px solid #333', padding: '16px' }}>
                  {/* Detalles */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '12px', color: '#b3b3b3' }}>
                        Email del cliente
                      </label>
                      {editingId === gallery.id ? (
                        <input
                          type="email"
                          value={editData.client_email || ''}
                          onChange={e =>
                            setEditData({
                              ...editData,
                              client_email: e.target.value,
                            })
                          }
                          style={{
                            marginTop: '4px',
                            padding: '8px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #d4af37',
                            color: '#f2f2f2',
                            borderRadius: '4px',
                            width: '100%',
                          }}
                        />
                      ) : (
                        <p style={{ marginTop: '4px' }}>{gallery.client_email}</p>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#b3b3b3' }}>
                        Fecha del evento
                      </label>
                      <p style={{ marginTop: '4px' }}>
                        {new Date(gallery.event_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#b3b3b3' }}>
                        Creada el
                      </label>
                      <p style={{ marginTop: '4px' }}>
                        {new Date(gallery.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: '#b3b3b3' }}>
                        Expira el
                      </label>
                      <p style={{ marginTop: '4px' }}>
                        {new Date(gallery.expires_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {/* Notas */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: '#b3b3b3' }}>
                      Notas (privadas)
                    </label>
                    {editingId === gallery.id ? (
                      <textarea
                        value={editData.notes || ''}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            notes: e.target.value,
                          })
                        }
                        style={{
                          marginTop: '4px',
                          padding: '8px',
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #d4af37',
                          color: '#f2f2f2',
                          borderRadius: '4px',
                          width: '100%',
                          minHeight: '60px',
                        }}
                      />
                    ) : (
                      <p style={{ marginTop: '4px', color: '#b3b3b3' }}>
                        {gallery.notes || 'Sin notas'}
                      </p>
                    )}
                  </div>

                  {/* Comentarios del Cliente */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: '#d4af37', fontWeight: 'bold' }}>
                      Comentarios del Cliente
                    </label>
                    <div style={{
                      marginTop: '4px',
                      padding: '12px',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      color: '#f2f2f2',
                      minHeight: '60px',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {gallery.client_comments || 'El cliente aún no ha dejado comentarios.'}
                    </div>
                  </div>

                  {/* Link de acceso */}
                  <div
                    style={{
                      marginBottom: '20px',
                      padding: '12px',
                      backgroundColor: '#0d0d0d',
                      borderRadius: '6px',
                      border: '1px solid #333',
                    }}
                  >
                    <label style={{ fontSize: '12px', color: '#b3b3b3' }}>
                      Link de acceso para el cliente
                    </label>
                    <div
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <code
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '4px',
                          fontSize: '11px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {`http://localhost:5174/gallery/${gallery.access_token}`}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `http://localhost:5174/gallery/${gallery.access_token}`,
                            gallery.access_token
                          )
                        }
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#d4af37',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '6px',
                          alignItems: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {copiedToken === gallery.access_token ? (
                          <>
                            <Check size={14} /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div>
                    <h4
                      style={{
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <ImageIcon size={16} />
                      Imágenes ({gallery.images?.length || 0})
                    </h4>

                    {/* Upload de nuevas imágenes */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#0d0d0d',
                        borderRadius: '6px',
                        border: '2px dashed #d4af37',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={() => handleAddImages(gallery.access_token)}
                          disabled={
                            uploadingId === gallery.access_token ||
                            !selectedFile
                          }
                          style={{
                            padding: '8px 16px',
                            backgroundColor:
                              uploadingId === gallery.access_token ||
                              !selectedFile
                                ? '#666'
                                : '#d4af37',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor:
                              uploadingId === gallery.access_token ||
                              !selectedFile
                                ? 'not-allowed'
                                : 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Plus size={14} />
                          Agregar
                        </button>
                      </div>
                      <p style={{ fontSize: '11px', color: '#b3b3b3', marginTop: '8px' }}>
                        {selectedFile
                          ? `Seleccionado: ${selectedFile.name}`
                          : 'Selecciona una imagen para agregar'}
                      </p>
                    </div>

                    {/* Grid de imágenes */}
                    {gallery.images && gallery.images.length > 0 ? (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                          gap: '12px',
                        }}
                      >
                        {gallery.images.map((img, idx) => {
                          const imageUrl = getImageUrl(img);
                          return (
                            <div
                              key={idx}
                              style={{
                                position: 'relative',
                                paddingBottom: '100%',
                                backgroundColor: '#2a2a2a',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                              }}
                            >
                              <img
                                src={`http://localhost:3001${imageUrl}`}
                                alt={`Imagen ${idx + 1}`}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                onError={e => {
                                  (e.target as HTMLImageElement).src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EError%3C/text%3E%3C/svg%3E';
                                }}
                              />

                              {/* Overlay con acciones */}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  display: 'flex',
                                  gap: '6px',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.3s',
                                }}
                                onMouseEnter={e =>
                                  ((e.currentTarget as HTMLElement).style.opacity =
                                    '1')
                                }
                                onMouseLeave={e =>
                                  ((e.currentTarget as HTMLElement).style.opacity =
                                    '0')
                                }
                              >
                                <button
                                  onClick={() => setPreviewImage(imageUrl)}
                                  style={{
                                    padding: '6px',
                                    backgroundColor: '#d4af37',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Ver"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    setImageToDelete({
                                      token: gallery.access_token,
                                      url: imageUrl,
                                    })
                                  }
                                  style={{
                                    padding: '6px',
                                    backgroundColor: '#ff4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ color: '#b3b3b3', textAlign: 'center' }}>
                        Sin imágenes
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de preview de imagen */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
            }}
          >
            <img
              src={`http://localhost:3001${previewImage}`}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                backgroundColor: '#d4af37',
                color: '#000',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación de imagen */}
      {imageToDelete && (
        <div
          onClick={() => setImageToDelete(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1a1a',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #333',
              maxWidth: '400px',
            }}
          >
            <h3 style={{ marginBottom: '16px' }}>¿Eliminar esta imagen?</h3>
            <p style={{ color: '#b3b3b3', marginBottom: '24px' }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() =>
                  handleDeleteImage(imageToDelete.token, imageToDelete.url)
                }
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Eliminar
              </button>
              <button
                onClick={() => setImageToDelete(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f2f2f2',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
