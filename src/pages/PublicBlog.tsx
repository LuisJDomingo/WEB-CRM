import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

export default function PublicBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Narrativa.News | Historias Visuales";
    fetch(`${import.meta.env.VITE_API_URL}/api/blog/posts`)
      .then(res => res.json())
      .then(data => {
        if (data.posts) setPosts(data.posts);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Header del Blog */}
      <header className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href={window.location.protocol + '//' + window.location.host.replace('news.', '')}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-black"
              title="Volver a la web principal"
            >
              <ArrowLeft size={20} />
            </a>
            <div className="font-serif text-xl font-bold tracking-tight">
              Narrativa<span className="text-zinc-400">.News</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-black transition-colors">Tendencias</a>
            <a href="#" className="hover:text-black transition-colors">Bodas Reales</a>
            <a href="#" className="hover:text-black transition-colors">Consejos</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Historias Visuales</h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Un espacio dedicado a la fotografía documental, el amor y los momentos que perduran.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Cargando historias...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map(post => (
              <article key={post.id} className="group cursor-pointer flex flex-col h-full">
                <div className="aspect-[4/3] bg-zinc-100 rounded-lg overflow-hidden mb-4 relative">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-50">
                      <span className="font-serif italic text-2xl">N.</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                    Noticia
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                    <span>{post.published_at ? format(new Date(post.published_at), 'd MMMM yyyy', { locale: es }) : 'Borrador'}</span>
                    <span>•</span>
                    <span>5 min lectura</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-zinc-600 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-zinc-500 text-sm line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <span className="text-sm font-bold underline decoration-zinc-300 underline-offset-4 group-hover:decoration-black transition-all">
                    Leer historia completa
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-zinc-50 border-t border-zinc-100 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center text-zinc-400 text-sm">
          <p>© {new Date().getFullYear()} Narrativa de Bodas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
