import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { generateContractHTML } from '@/utils/ContractNarrativaBodas';
import { CheckCircle, PenTool, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Cliente Supabase anónimo para acceso público
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PublicContractProps {
  params: {
    token: string;
  };
}

export default function PublicContract({ params }: PublicContractProps) {
  const token = params?.token;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Cambiar el título de la pestaña para que sea profesional
  useEffect(() => {
    document.title = "Firma de Contrato - Narrativa de Bodas";
    if (contract?.clients?.name) {
      document.title = `Contrato para ${contract.clients.name} - Narrativa de Bodas`;
    }
  }, [contract]);

  useEffect(() => {
    if (token) {
      fetchContract();
    } else {
      setLoading(false);
      setErrorMsg('Enlace no válido (Falta el token)');
    }
  }, [token]);

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, clients(name, email)')
        .eq('signing_token', token)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Contrato no encontrado');

      setContract(data);
      if (data.contract_status === 'firmado' || data.contract_status === 'pendiente_pago' || data.contract_status === 'completado') {
        setSignedSuccess(true);
      }
    } catch (error: any) {
      console.error('Error cargando contrato:', error);
      setErrorMsg('No se pudo cargar el contrato. El enlace puede haber caducado o no es válido.');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!clientNameInput.trim()) {
      toast.error('Por favor, escribe tu nombre completo para firmar.');
      return;
    }

    setSigning(true);
    try {
      // 1. Obtener IP del cliente (para validez legal)
      let clientIp = 'No disponible';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          clientIp = ipData.ip;
        }
      } catch (e) {
        console.warn('Error obteniendo IP:', e);
      }
      
      const userAgent = navigator.userAgent;

      // 2. Actualizar contrato en Supabase
      const { error } = await supabase
        .from('contracts')
        .update({
          contract_status: 'firmado', // Avanza al estado firmado
          signed_at: new Date().toISOString(),
          signed_ip: clientIp,
          signed_user_agent: userAgent
        })
        .eq('id', contract.id)
        .eq('signing_token', token); // Doble verificación de seguridad

      if (error) throw error;

      setSignedSuccess(true);
      toast.success('Contrato firmado correctamente');
    } catch (error: any) {
      console.error('Error al firmar:', error);
      toast.error(`Error al firmar: ${error.message || 'Inténtalo de nuevo'}`);
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  if (errorMsg || !contract) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <AlertTriangle size={48} className="text-red-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">No disponible</h1>
      <p className="text-gray-600 mt-2">{errorMsg}</p>
    </div>
  );

  // Generar HTML del contrato
  const contractHtml = generateContractHTML({
    legal_name: contract.legal_name,
    dni: contract.dni,
    address: contract.address,
    total_amount: contract.total_amount,
    deposit_amount: contract.deposit_amount,
    client_name: contract.clients?.name || '',
    client_email: contract.clients?.email || ''
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
          <div><h1 className="text-xl font-bold">Firma de Contrato</h1><p className="text-gray-400 text-sm">Narrativa de Bodas</p></div>
          {signedSuccess && (<div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30"><CheckCircle size={20} /><span className="font-bold text-sm">FIRMADO</span></div>)}
        </div>
        <div className="h-[60vh] bg-gray-50 border-b border-gray-200 overflow-y-auto p-4">
          <div className="bg-white shadow-sm p-8 min-h-full max-w-[800px] mx-auto origin-top scale-90 sm:scale-100">
             <div dangerouslySetInnerHTML={{ __html: contractHtml }} />
          </div>
        </div>
        <div className="p-8 bg-white">
          {signedSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Gracias! El contrato ha sido firmado.</h2>
              <p className="text-gray-600">Hemos registrado tu firma digitalmente.<br/>Fecha: {new Date(contract.signed_at || new Date()).toLocaleString()}</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><PenTool size={20} className="text-blue-600" />Aceptación y Firma</h3>
              <p className="text-sm text-gray-600 mb-6">Al firmar este documento, aceptas los términos y condiciones expresados arriba.</p>
              <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Escribe tu nombre completo para firmar</label><input type="text" value={clientNameInput} onChange={(e) => setClientNameInput(e.target.value)} placeholder="Ej: Juan Pérez García" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div><button onClick={handleSign} disabled={signing} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">{signing ? <Loader2 className="animate-spin" /> : <PenTool size={18} />}{signing ? 'Registrando firma...' : 'Firmar Contrato Digitalmente'}</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}