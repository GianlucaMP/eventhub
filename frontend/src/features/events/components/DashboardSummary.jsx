import React from 'react';
import { Calendar, Ticket, Users } from 'lucide-react';
import StatCard from './StatCard.jsx';
const DashboardSummary = ({ eventos }) => {
  const cifras = [
    { titulo: 'Eventos', valor: eventos?.length, icono: Calendar, color: 'blue' },
    { titulo: 'Con cupo', valor: eventos?.filter((evento) => evento.cuposDisponibles > 0).length, icono: Users, color: 'green' },
    { titulo: 'Cupos disponibles', valor: eventos?.reduce((total, evento) => total + evento.cuposDisponibles, 0), icono: Ticket, color: 'orange' },
  ];

  return (
    <dl className="stats" aria-label="Resumen de eventos">
      {cifras.map((cifra) => <StatCard key={cifra.titulo} {...cifra} />)}
    </dl>
  );
};

export default DashboardSummary;
