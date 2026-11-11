import React from 'react';
import { CircleCheck } from 'lucide-react';
const RegistrationConfirmation = ({ confirmacion, confirmacionRef }) => (
  <div className="confirmation" role="status" ref={confirmacionRef} tabIndex={-1}>
    <span className="confirmation-icon"><CircleCheck size={26} /></span>
    <div><strong>Inscripción confirmada</strong><p>Ya tenés tu lugar en {confirmacion}.</p></div>
  </div>
);

export default RegistrationConfirmation;
