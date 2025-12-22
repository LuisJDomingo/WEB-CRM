import { Link } from 'wouter';
import { Users, BarChart3 } from 'lucide-react';
import { AdminPageLayout } from '@/components/AdminPageLayout';

export default function AdminCrmHub() {
  const menuItems = [
    {
      title: 'Clientes',
      description: 'Base de datos y fichas de clientes',
      icon: <Users size={32} />,
      href: '/admin/crm',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Visualización de la Contactación',
      description: 'Embudo de ventas y estados',
      icon: <BarChart3 size={32} />,
      href: '/admin/pipeline',
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  return (
    <AdminPageLayout title="CRM Suite" subtitle="Gestión integral de clientes y ventas">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="block p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </Link>
        ))}
      </div>
    </AdminPageLayout>
  );
}