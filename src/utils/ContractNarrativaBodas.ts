export const generateContractHTML = (data: {
  legal_name: string;
  dni: string;
  address: string;
  total_amount: string;
  deposit_amount: string;
  client_name: string;
  client_email: string;
}) => {
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const remainingAmount = (parseFloat(data.total_amount || '0') - parseFloat(data.deposit_amount || '0')).toFixed(2);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contrato de Servicios - Narrativa de Bodas</title>
        <style>
          body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { text-align: center; margin-bottom: 60px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
          h2 { font-size: 16px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
          .subtitle { font-style: italic; color: #666; margin-top: 10px; }
          
          .section { margin-bottom: 20px; text-align: justify; }
          .field { font-weight: bold; color: #000; text-decoration: underline; }
          
          .clauses { counter-reset: clause; margin-top: 30px; }
          .clause { margin-bottom: 15px; }
          .clause::before { counter-increment: clause; content: counter(clause) ". "; font-weight: bold; }
          .clause-title { font-weight: bold; text-transform: uppercase; font-size: 14px; }
          
          .financial-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .financial-table th, .financial-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .financial-table th { background-color: #f9f9f9; }
          
          .signatures { margin-top: 80px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .sig-box { width: 45%; border-top: 1px solid #000; padding-top: 10px; }
          .sig-title { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 40px; }
          
          @media print {
            body { padding: 0; font-size: 12pt; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Contrato de Servicios Fotográficos</h1>
          <div class="subtitle">Narrativa de Bodas - Documento Modelo</div>
        </div>

        <div class="section">
          <p>En <strong>Madrid</strong>, a <strong>${date}</strong>.</p>
        </div>

        <div class="section">
          <h2>REUNIDOS</h2>
          <p>De una parte, <strong>NARRATIVA DE BODAS</strong> (Luis Domingo), con domicilio profesional en Madrid, en adelante el <strong>FOTÓGRAFO</strong>.</p>
          <p>Y de otra parte, <strong>${data.legal_name || '________________________________'}</strong>, con DNI/NIF <strong>${data.dni || '__________________'}</strong> y domicilio en <strong>${data.address || '________________________________________________'}</strong>, en adelante el <strong>CLIENTE</strong>.</p>
          <p>Ambas partes se reconocen capacidad legal suficiente para suscribir el presente contrato y,</p>
        </div>

        <div class="section">
          <h2>EXPONEN</h2>
          <p>Que el CLIENTE está interesado en contratar los servicios profesionales del FOTÓGRAFO para la cobertura de su evento, y el FOTÓGRAFO acepta realizar dicho encargo con sujeción a las siguientes:</p>
        </div>

        <div class="section">
          <h2>CLÁUSULAS</h2>
          <div class="clauses">
            <div class="clause"><span class="clause-title">OBJETO.</span> El FOTÓGRAFO realizará el reportaje fotográfico/videográfico del evento acordado, aplicando su criterio artístico y profesional.</div>
            
            <div class="clause"><span class="clause-title">CONDICIONES ECONÓMICAS.</span> El precio de los servicios se detalla a continuación:</div>
            
            <table class="financial-table">
              <tr>
                <th>Concepto</th>
                <th>Importe</th>
              </tr>
              <tr>
                <td>Precio Total del Servicio</td>
                <td><strong>${data.total_amount} €</strong></td>
              </tr>
              <tr>
                <td>Señal / Reserva (Abonar a la firma)</td>
                <td><strong>${data.deposit_amount} €</strong></td>
              </tr>
              <tr>
                <td>Restante (Antes de la entrega)</td>
                <td><strong>${remainingAmount} €</strong></td>
              </tr>
            </table>

            <div class="clause"><span class="clause-title">DERECHOS DE IMAGEN.</span> El FOTÓGRAFO ostenta la propiedad intelectual de las obras. El CLIENTE recibe derechos de uso privado y familiar. El FOTÓGRAFO se reserva el derecho de usar las imágenes para su autopromoción (web, redes sociales, concursos), salvo revocación expresa por escrito.</div>
            
            <div class="clause"><span class="clause-title">CANCELACIÓN.</span> En caso de cancelación por parte del CLIENTE, la señal entregada no será reembolsada en concepto de indemnización por la fecha bloqueada.</div>
            
            <div class="clause"><span class="clause-title">PROTECCIÓN DE DATOS.</span> Los datos personales facilitados serán tratados únicamente para la gestión del servicio contratado y la facturación, conforme a la normativa vigente.</div>
          </div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-title">Por el Fotógrafo</div>
            <p>Fdo: Luis Domingo</p>
          </div>
          <div class="sig-box">
            <div class="sig-title">Por el Cliente</div>
            <p>Fdo: ${data.legal_name || data.client_name}</p>
          </div>
        </div>
      </body>
    </html>
  `;
};