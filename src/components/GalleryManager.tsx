import { useState } from 'react';
import { Mail, Plus, Copy, Check, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryManagerProps {
  onGalleryCreated?: () => void;
}

export default function GalleryManager({ onGalleryCreated }: GalleryManagerProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    eventDate: '',
    password: '',
    chronicle: '', // Añadido para la crónica
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createdGallery, setCreatedGallery] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('clientName', formData.clientName);
      formDataToSend.append('clientEmail', formData.clientEmail);
      formDataToSend.append('eventDate', formData.eventDate);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('chronicle', formData.chronicle); // Añadir crónica al FormData
      
      // Agregar archivos de imágenes
      selectedFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gallery/create-with-images`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Error al crear galería');
        console.error('Error response:', error);
        return;
      }

      const data = await response.json();
      console.log('Gallery created:', data);
      console.log('AccessLink:', data.accessLink);
      
      // Guardar el objeto completo con el accessLink
      const galleryData = {
        ...data.gallery,
        accessLink: data.accessLink,
        imagesCount: data.imagesCount,
      };
      
      console.log('Setting gallery:', galleryData);
      setCreatedGallery(galleryData);
      setFormData({ clientName: '', clientEmail: '', eventDate: '', password: '', chronicle: '' });
      setSelectedFiles([]);
      toast.success(`¡Galería creada con ${data.imagesCount} imágenes!`);
      
      // Llamar callback si se proporciona
      if (onGalleryCreated) {
        setTimeout(onGalleryCreated, 1500);
      }
    } catch (error) {
      toast.error('Error al crear la galería');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdGallery?.accessLink) {
      navigator.clipboard.writeText(createdGallery.accessLink);
      setCopiedLink(true);
      toast.success('Link copiado');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendEmailLink = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/gallery/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.clientEmail,
          accessLink: createdGallery?.accessLink,
          clientName: formData.clientName,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast.success('Email enviado exitosamente');
      } else {
        toast.error('Error al enviar email');
      }
    } catch (error) {
      toast.error('Error al enviar email');
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Crear Galería Privada
        </h2>
        <p className="text-muted-foreground">Crea un acceso privado para los clientes</p>
      </div>

      {!createdGallery ? (
        <form onSubmit={handleCreateGallery} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre del cliente
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Ej: Juan y María"
              required
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email del cliente
            </label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              placeholder="cliente@ejemplo.com"
              required
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha del evento
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contraseña de acceso
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Crea una contraseña segura"
              required
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Crónica del Evento (Opcional)
            </label>
            <textarea
              name="chronicle"
              value={formData.chronicle}
              onChange={handleChange}
              placeholder="Escribe aquí un reportaje o texto emotivo sobre el evento..."
              rows={6}
              className="form-input w-full resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Subir fotos de la galería
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer transition-colors bg-card/50 hover:border-primary">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <Upload size={24} className="mx-auto text-primary mb-2" />
                <p className="text-foreground text-sm font-medium">
                  Haz clic para seleccionar imágenes
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  o arrastra fotos aquí
                </p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-card/80 rounded-lg">
                <p className="text-sm font-semibold mb-2">
                  {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''} seleccionado{selectedFiles.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus size={18} />
            {isLoading ? 'Creando...' : `Crear Galería${selectedFiles.length > 0 ? ` (${selectedFiles.length} fotos)` : ''}`}
          </button>
        </form>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-primary mb-4">
            ✓ Galería creada {createdGallery?.imagesCount > 0 && `con ${createdGallery.imagesCount} fotos`}
          </h3>

          <div className="bg-background p-3 rounded-lg mb-4">
            <p className="text-xs text-muted-foreground mb-1 text-left">Link de acceso:</p>
            <div className="flex gap-2 items-center">
              <code className="text-primary text-sm break-all text-left flex-1 bg-muted/50 p-2 rounded">
                {createdGallery?.accessLink || 'Generando link...'}
              </code>
              {createdGallery?.accessLink && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-muted hover:bg-muted/80 rounded"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={sendEmailLink}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              <Mail size={18} />
              Enviar por Email
            </button>

            <button
              onClick={() => setCreatedGallery(null)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted text-muted-foreground rounded-lg font-bold hover:bg-muted/80 transition-colors"
            >
              Crear otra galería
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
