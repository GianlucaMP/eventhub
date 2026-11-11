import React from 'react';

const StatCard = ({ titulo, valor, icono: Icono, color }) => (
  <div className="stat">
    <div><dt>{titulo}</dt><dd>{valor ?? '—'}</dd></div>
    <span className={`stat-icon ${color}`}><Icono size={28} /></span>
  </div>
);

export default StatCard;
