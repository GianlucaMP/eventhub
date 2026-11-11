import React from 'react';
import { Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button.jsx';
import RegistrationConfirmation from '../../registrations/components/RegistrationConfirmation.jsx';
import RegistrationForm from '../../registrations/components/RegistrationForm.jsx';
import { useEventRegistration } from '../../registrations/hooks/useEventRegistration.js';
import { useEvents } from '../hooks/useEvents.js';
import DashboardSummary from './DashboardSummary.jsx';
import EventCard from './EventCard.jsx';

const EventCatalog = ({ children }) => {
  const { eventos, cargando, errorCatalogo, cargarEventos } = useEvents();
  const {
    seleccion, enviando, elegirEvento,
    campos, cambiarCampo, errorInscripcion, nombreInput, inscribir,
    confirmacion, confirmacionRef,
  } = useEventRegistration(cargarEventos);

  return (
    <>
      <DashboardSummary eventos={eventos} />
      {children}
      {confirmacion && (
        <RegistrationConfirmation confirmacion={confirmacion} confirmacionRef={confirmacionRef} />
      )}
      <section className="catalog" id="eventos" aria-labelledby="catalogo-titulo">
        <h2 id="catalogo-titulo"><Calendar size={22} /> Próximos eventos</h2>
        {cargando && <p className="catalog-status" role="status">{eventos ? 'Actualizando cupos…' : 'Cargando eventos…'}</p>}
        {errorCatalogo && (
          <div className="catalog-error">
            <p role="alert">{errorCatalogo}</p>
            <Button variant="secondary" onClick={cargarEventos}>Recargar eventos</Button>
          </div>
        )}
        {!cargando && !errorCatalogo && eventos?.length === 0 && (
          <p className="catalog-status">Por ahora no hay eventos publicados.</p>
        )}
        <div className="event-list">
          {eventos?.map((evento) => (
            <EventCard
              key={evento.id}
              evento={evento}
              abierto={seleccion === evento.id}
              ocupado={enviando}
              onSelect={(event) => elegirEvento(evento, event.currentTarget)}
            >
              {seleccion === evento.id && (
                <RegistrationForm
                  evento={evento}
                  campos={campos}
                  enviando={enviando}
                  error={errorInscripcion}
                  nombreInput={nombreInput}
                  onChange={cambiarCampo}
                  onSubmit={(event) => inscribir(event, evento)}
                />
              )}
            </EventCard>
          ))}
        </div>
      </section>
    </>
  );
};

export default EventCatalog;
