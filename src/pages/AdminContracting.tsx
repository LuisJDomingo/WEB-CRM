import { useState, useEffect } from 'react';
import { AdminPageLayout } from '@/components/AdminPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileSignature, DollarSign, Send, CheckCircle, FileText, AlertCircle, Edit, Printer, X, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Redirect } from 'wouter';
import { createClient } from '@supabase/supabase-js';
import { generateContractHTML } from '@/utils/ContractNarrativaBodas';

// Configuración de Supabase (Igual que en Agenda)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Contract {
  id: string;
  client_id: string;
  client_name: string; // Join con clients
  client_email: string;
  total_amount: number;
  deposit_amount: number;
  contract_status: 'borrador' | 'pendiente_firma' | 'firmado' | 'pendiente_pago' | 'completado';
  created_at: string;
  signing_token?: string;
  legal_name?: string;
  dni?: string;
  address?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function AdminContracting() {
  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]); // Para el selector de nuevo contrato
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailToSend, setEmailToSend] = useState('');
  const [signingLink, setSigningLink] = useState('');
  
  // Formulario nuevo contrato
  const [formData, setFormData] = useState({
    client_id: '',
    total_amount: '',
    deposit_amount: '',
    legal_name: '',
    dni: '',
    address: '',
  });

  // Cargar contratos y clientes
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Contratos (Siempre necesario)
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('*, clients(name, email)')
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      const formattedContracts = (contractsData || []).map((c: any) => ({
        id: c.id,
        client_id: c.client_id,
        client_name: c.clients?.name || 'Cliente desconocido',
        client_email: c.clients?.email || '',
        total_amount: c.total_amount,
        deposit_amount: c.deposit_amount,
        contract_status: c.contract_status,
        created_at: c.created_at,
        legal_name: c.legal_name,
        dni: c.dni,
        address: c.address,
        signing_token: c.signing_token
      }));
      setContracts(formattedContracts);

      // 2. Si hay un client_id en la URL y NO tiene contrato, cargamos sus datos específicos
      // Esto evita cargar TODOS los clientes de la base de datos, mejorando drásticamente el rendimiento
      const params = new URLSearchParams(window.location.search);
      const clientIdParam = params.get('client_id');
      
      if (clientIdParam) {
        const hasContract = formattedContracts.some(c => c.client_id === clientIdParam);
        if (!hasContract) {
           const { data: clientData, error: clientError } = await supabase
             .from('clients')
             .select('*')
             .eq('id', clientIdParam)
             .single();
             
           if (!clientError && clientData) {
             setClients([clientData]);
           }
        }
      } else {
        setClients([]);
      }

    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos de contratación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, token]);

  // Detectar si venimos redirigidos con un cliente para contratar
  useEffect(() => {
    if (loading) return; // Esperar a que carguen los datos
    const params = new URLSearchParams(window.location.search);
    const clientIdParam = params.get('client_id');
    
    if (clientIdParam) {
      // Verificar si ya existe un contrato para este cliente (RECUPERACIÓN)
      const existingContract = contracts.find(c => c.client_id === clientIdParam);
      
      if (existingContract) {
        openEditModal(existingContract);
      } else {
        // Si no existe, preparamos formulario nuevo
        const clientInfo = clients.find(c => c.id === clientIdParam);
        setFormData(prev => ({ ...prev, client_id: clientIdParam, legal_name: clientInfo?.name || '' }));
        setIsEditing(false);
        setShowModal(true);
      }
    }
  }, [loading, contracts, clients]); // Dependencias clave para que funcione al recargar

  const openEditModal = (contract: Contract) => {
    setFormData({
      client_id: contract.client_id,
      total_amount: contract.total_amount.toString(),
      deposit_amount: contract.deposit_amount.toString(),
      legal_name: contract.legal_name || '',
      dni: contract.dni || '',
      address: contract.address || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        client_id: formData.client_id,
        total_amount: parseFloat(formData.total_amount),
        deposit_amount: parseFloat(formData.deposit_amount),
        legal_name: formData.legal_name,
        dni: formData.dni,
        address: formData.address,
        contract_status: 'borrador',
      };

      // 1. Guardar en tabla 'contracts' (Upsert: Insertar o Actualizar si existe por client_id)
      const { error: contractError } = await supabase
        .from('contracts')
        .upsert(payload, { onConflict: 'client_id' });

      if (contractError) throw contractError;

      // 2. Actualizar estado del cliente a 'en contratacion'
      await supabase
        .from('clients')
        .update({ status: 'en contratacion' })
        .eq('id', formData.client_id);

      toast.success('Datos guardados. Abriendo vista previa...');
      
      // Limpiar URL para evitar reapertura del modal por el useEffect al recargar datos
      const url = new URL(window.location.href);
      if (url.searchParams.has('client_id')) {
        url.searchParams.delete('client_id');
        window.history.replaceState({}, '', url.toString());
      }

      setShowModal(false);
      setIsEditing(false);
      setShowPreviewModal(true);
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al guardar');
    }
  };

  const updateStatus = async (id: string, newStatus: Contract['contract_status']) => {
    try {
      // Actualizar estado en tabla contracts
      const { error } = await supabase
        .from('contracts')
        .update({ contract_status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Si el contrato se completa, actualizamos también el estado general del cliente
      if (newStatus === 'completado') {
        // Buscar el client_id asociado a este contrato para actualizar su estado
        const contract = contracts.find(c => c.id === id);
        if (contract) {
          await supabase.from('clients').update({ status: 'contratado' }).eq('id', contract.client_id);
        }
      }

      setContracts(prev => prev.map(c => c.id === id ? { ...c, contract_status: newStatus } : c));
      
      if (newStatus === 'pendiente_firma') toast.success('Estado: Esperando firma del cliente');
      if (newStatus === 'firmado') toast.success('Estado: Contrato Firmado');
      if (newStatus === 'completado') toast.success('¡Contratación finalizada! Cliente actualizado.');
    } catch (error) {
      toast.error('Error al actualizar el contrato');
      throw error; // Importante: Lanzar el error para que handleSendContract sepa que falló
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'borrador': return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 flex items-center gap-1"><FileText size={12}/> Borrador</span>;
      case 'pendiente_firma': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1"><FileSignature size={12}/> Pendiente de Firma</span>;
      case 'firmado': return <span className="px-2 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1"><FileSignature size={12}/> Firmado</span>;
      case 'pendiente_pago': return <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><DollarSign size={12}/> Falta Pago</span>;
      case 'completado': return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1"><CheckCircle size={12}/> Completado</span>;
      default: return null;
    }
  };

  const getClientDisplayInfo = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) return { name: client.name, email: client.email };
    const contract = contracts.find(c => c.client_id === clientId);
    if (contract) return { name: contract.client_name, email: contract.client_email };
    return { name: 'Cargando...', email: '' };
  };

  const handlePrintContract = () => {
    const clientInfo = getClientDisplayInfo(formData.client_id);
    const html = generateContractHTML({
      legal_name: formData.legal_name,
      dni: formData.dni,
      address: formData.address,
      total_amount: formData.total_amount,
      deposit_amount: formData.deposit_amount,
      client_name: clientInfo.name,
      client_email: clientInfo.email
    });
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      // printWindow.print(); // Descomentar para imprimir automáticamente
    }
  };

  const handleApproveAndContinue = () => {
    const clientInfo = getClientDisplayInfo(formData.client_id);
    setEmailToSend(clientInfo.email);
    setShowPreviewModal(false);
    setShowSendModal(true);
  };

  const handleSendContract = async () => {
    try {
      // Buscar el contrato asociado al cliente actual para obtener su ID real
      let contract = contracts.find(c => c.client_id === formData.client_id);
      
      // Si no está en la lista local (por si acaso), lo buscamos en DB
      if (!contract) {
         const { data } = await supabase.from('contracts').select('*').eq('client_id', formData.client_id).single();
         if (data) contract = data;
      }

      if (!contract) throw new Error('No se encontró el contrato para actualizar');

      // Generar token si no existe (para contratos antiguos o creados antes de la migración)
      if (!contract.signing_token) {
         // Generador de UUID robusto (funciona incluso si crypto.randomUUID no está disponible)
         const newToken = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });

         const { error: tokenError } = await supabase
            .from('contracts')
            .update({ signing_token: newToken })
            .eq('id', contract.id);
            
         if (tokenError) throw tokenError;
         contract.signing_token = newToken;
      }

      await updateStatus(contract.id, 'pendiente_firma');
      
      // Generar enlace
      const link = `${window.location.origin}/contract/${contract.signing_token}`;
      setSigningLink(link);
      toast.success('Contrato listo para enviar');
      // No cerramos el modal inmediatamente, mostramos el link
    } catch (error: any) {
      console.error('Error en envío:', error);
      toast.error(`Error: ${error.message || 'No se pudo generar el enlace'}`);
    }
  };

  const handleSendEmailAndClose = async () => {
    if (!signingLink) {
      setShowSendModal(false);
      setSigningLink('');
      return;
    }

    const toastId = toast.loading('Enviando contrato por email...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/contract/send-link`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: emailToSend,
          link: signingLink,
          clientName: formData.legal_name || getClientDisplayInfo(formData.client_id).name
        })
      });

      if (response.ok) {
        toast.success('Email enviado correctamente', { id: toastId });
      } else {
        toast.error('No se pudo enviar el email automáticamente. Verifica el enlace.', { id: toastId });
      }
    } catch (error) {
      toast.error('Error de conexión al enviar email', { id: toastId });
    } finally {
      setShowSendModal(false);
      setSigningLink('');
    }
  };

  if (isAuthLoading) return <div>Cargando...</div>;
  return (
    <AdminPageLayout title="Gestión de Contrataciones" subtitle="Flujo de firma y pagos de adelantos">
      
      {/* KANBAN / LISTA DE PROGRESO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['borrador', 'pendiente_firma', 'firmado', 'completado'].map(status => (
          <div key={status} className="bg-card border border-border p-4 rounded-xl">
            <h3 className="uppercase text-xs font-bold text-muted-foreground mb-2 tracking-wider">
              {status.replace('_', ' ')}
            </h3>
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.contract_status === status).length}
            </div>
          </div>
        ))}
      </div>

      {/* TABLA DE CONTRATOS */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Importes</th>
              <th className="px-6 py-4">Estado Actual</th>
              <th className="px-6 py-4">Fecha Creación</th>
              <th className="px-6 py-4 text-right">Acciones (Flujo)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contracts.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No hay procesos de contratación activos.</td></tr>
            ) : (
              contracts.map(contract => (
                <tr 
                  key={contract.id} 
                  className={`hover:bg-muted/30 transition-colors ${['borrador', 'pendiente_firma'].includes(contract.contract_status) ? 'cursor-pointer' : ''}`}
                  onClick={() => ['borrador', 'pendiente_firma'].includes(contract.contract_status) && openEditModal(contract)}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold">{contract.client_name}</p>
                    <p className="text-xs text-muted-foreground">{contract.client_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p>Total: <span className="font-mono">{contract.total_amount}€</span></p>
                    <p className="text-xs text-muted-foreground">Señal: {contract.deposit_amount}€</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(contract.contract_status)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(contract.created_at), 'dd MMM yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {contract.contract_status === 'borrador' && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(contract); }}
                            className="p-2 bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white rounded transition-colors"
                            title="Retomar toma de datos / Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateStatus(contract.id, 'pendiente_firma'); }}
                            className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition-colors"
                            title="Enviar contrato para firma"
                          >
                            <Send size={16} /> Enviar
                          </button>
                        </>
                      )}
                      {contract.contract_status === 'pendiente_firma' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(contract); }}
                          className="p-2 bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white rounded transition-colors"
                          title="Editar contrato enviado"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {(contract.contract_status === 'pendiente_firma') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateStatus(contract.id, 'firmado'); }}
                          className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded transition-colors"
                          title="Marcar como firmado / Solicitar Pago"
                        >
                          <FileSignature size={16} /> Pendiente de firma
                        </button>
                      )}
                      {(contract.contract_status === 'firmado' || contract.contract_status === 'pendiente_pago') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateStatus(contract.id, 'completado'); }}
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition-colors"
                          title="Confirmar pago y finalizar"
                        >
                          <DollarSign size={16} /> Confirmar Pago
                        </button>
                      )}
                      {contract.contract_status === 'completado' && (
                        <span className="text-green-500 text-xs font-bold flex items-center gap-1 justify-end">
                          <CheckCircle size={14} /> Finalizado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVO CONTRATO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border text-card-foreground rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Editar Datos del Contrato' : 'Iniciar Nueva Contratación'}</h3>
            <form onSubmit={handleSaveAndContinue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID Cliente</label>
                <div className="w-full p-2 rounded border border-input bg-muted text-foreground font-medium font-mono text-xs">
                  {formData.client_id}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Importe Total (€)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 rounded border border-input bg-background"
                    value={formData.total_amount}
                    onChange={e => {
                      const total = parseFloat(e.target.value);
                      const defaultDeposit = isNaN(total) ? '' : Math.round(total * 0.30).toString();
                      setFormData({
                        ...formData, 
                        total_amount: e.target.value,
                        deposit_amount: defaultDeposit
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Señal / Adelanto (€)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 rounded border border-input bg-background"
                    value={formData.deposit_amount}
                    onChange={e => setFormData({...formData, deposit_amount: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Nuevos campos de datos del contratante */}
              <div className="space-y-4 border-t border-border pt-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Datos del Contratante</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre Completo / Razón Social</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded border border-input bg-background"
                    value={formData.legal_name}
                    onChange={e => setFormData({...formData, legal_name: e.target.value})}
                    placeholder="Nombre completo para el contrato"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">DNI / NIF</label>
                    <input 
                      type="text" 
                      className="w-full p-2 rounded border border-input bg-background"
                      value={formData.dni}
                      onChange={e => setFormData({...formData, dni: e.target.value})}
                      placeholder="DNI/NIF"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dirección Postal</label>
                    <input 
                      type="text" 
                      className="w-full p-2 rounded border border-input bg-background"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Dirección completa"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={handlePrintContract}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition flex items-center justify-center gap-2"
                  title="Generar PDF / Imprimir"
                >
                  <Printer size={18} />
                </button>
                <button type="button" onClick={() => { setShowModal(false); setIsEditing(false); }} className="flex-1 py-2 bg-muted hover:bg-muted/80 rounded">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded font-bold hover:opacity-90">Guardar y Continuar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE VISTA PREVIA DEL CONTRATO */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border text-card-foreground rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/50">
              <h3 className="text-xl font-bold">Revisión de Contrato</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 bg-white overflow-hidden relative">
               <iframe 
                 srcDoc={generateContractHTML({
                    legal_name: formData.legal_name,
                    dni: formData.dni,
                    address: formData.address,
                    total_amount: formData.total_amount,
                    deposit_amount: formData.deposit_amount,
                    client_name: getClientDisplayInfo(formData.client_id).name,
                    client_email: getClientDisplayInfo(formData.client_id).email
                 })}
                 className="w-full h-full border-none"
                 title="Vista Previa Contrato"
               />
            </div>
            <div className="p-4 border-t border-border bg-muted/50 flex justify-end gap-2">
               <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded">Cerrar</button>
               <button onClick={handlePrintContract} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition flex items-center gap-2" title="Imprimir copia">
                 <Printer size={18} />
               </button>
               <button onClick={handleApproveAndContinue} className="px-4 py-2 bg-primary text-primary-foreground rounded font-bold hover:opacity-90 flex items-center gap-2">
                 <CheckCircle size={18} /> Guardar y Continuar (Envío)
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ENVÍO */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border text-card-foreground rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Send size={24} className="text-blue-500" />
              Confirmar Envío
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Firmante:</span>
                  <span className="font-medium">{formData.legal_name || getClientDisplayInfo(formData.client_id).name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Importe Total:</span>
                  <span className="font-medium">{formData.total_amount} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Señal a pagar:</span>
                  <span className="font-medium">{formData.deposit_amount} €</span>
                </div>
              </div>

              <div>
                {!signingLink ? (
                  <>
                    <label className="block text-sm font-medium mb-1">Enviar a (Email)</label>
                    <input 
                      type="email" 
                      className="w-full p-2 rounded border border-input bg-background"
                      value={emailToSend}
                      onChange={e => setEmailToSend(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se generará un enlace único y seguro para la firma.
                    </p>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle size={16} /> Enlace de Firma Generado
                    </p>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={signingLink} 
                        className="flex-1 p-2 text-xs bg-white border border-green-200 rounded select-all"
                      />
                      <button 
                        onClick={() => { navigator.clipboard.writeText(signingLink); toast.success('Copiado'); }}
                        className="p-2 bg-white border border-green-200 rounded hover:bg-green-100 text-green-700"
                        title="Copiar"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Copia este enlace y envíalo al cliente por Email o WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={signingLink ? handleSendEmailAndClose : () => { setShowSendModal(false); setSigningLink(''); }} 
                className="flex-1 py-2 bg-muted hover:bg-muted/80 rounded"
              >
                {signingLink ? 'Enviar y Cerrar' : 'Cancelar'}
              </button>
              {!signingLink && (
                <button 
                  onClick={handleSendContract} 
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  Generar Enlace
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}