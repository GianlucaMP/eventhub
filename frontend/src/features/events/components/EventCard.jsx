import React from 'react';
import Avatar from '../../../components/ui/Avatar.jsx';
import Button from '../../../components/ui/Button.jsx';
import Card from '@mui/material/Card';
import { Calendar, Clock3, MapPin, Users } from 'lucide-react';

const timeZone = 'America/Argentina/Buenos_Aires';
const fechaArgentina = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone });
const horaArgentina = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone });
const EventCard = ({ evento, abierto, ocupado, onSelect, children }) => {
  const { id, titulo, descripcion, fecha, modalidad, cuposDisponibles } = evento;
  const iniciales = titulo.split(/\s+/).at(-1).slice(0, 2).toUpperCase();

  const fechaEvento = new Date(fecha);
  const cupos = cuposDisponibles === 1 ? '1 cupo disponible' : `${cuposDisponibles} cupos disponibles`;

  return (
    <Card component="article" variant="outlined" className={abierto ? 'event-card is-open' : 'event-card'}>
      <div className="event-row">
        <Avatar aria-hidden="true">{iniciales}</Avatar>
        <div className="event-info">
          <h3>{titulo}</h3>
          <p>{descripcion}</p>
          <div className="event-meta">
            <time dateTime={fecha} title="Hora argentina">
              <span><Calendar size={16} />{fechaArgentina.format(fechaEvento)}</span>
              <span><Clock3 size={16} />{horaArgentina.format(fechaEvento)}</span>
            </time>
            <span><MapPin size={16} />{modalidad}</span>
          </div>
        </div>
        <div className="event-actions">
          <span className={cuposDisponibles > 0 ? 'availability available' : 'availability'}>
            <Users size={16} />{cuposDisponibles ? cupos : 'Sin cupo'}
          </span>
          <Button
            type="button"
            disabled={ocupado || (!abierto && cuposDisponibles === 0)}
            aria-expanded={abierto}
            aria-controls={abierto ? `inscripcion-${id}` : undefined}
            aria-label={abierto ? `Cerrar formulario de ${titulo}` : `Inscribirme en ${titulo}`}
            onClick={onSelect}
          >
            {abierto ? 'Cerrar formulario' : 'Inscribirme'}
          </Button>
        </div>
      </div>
      {children}
    </Card>
  );
};

export default EventCard;
