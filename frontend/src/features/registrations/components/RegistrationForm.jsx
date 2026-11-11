import React from 'react';
import Button from '../../../components/ui/Button.jsx';
import FormField from '../../../components/ui/FormField.jsx';

const RegistrationForm = ({ evento, campos, enviando, error, nombreInput, onChange, onSubmit }) => (
  <form
    className="registration"
    id={`inscripcion-${evento.id}`}
    aria-labelledby="inscripcion-titulo"
    onSubmit={onSubmit}
  >
    <h4 id="inscripcion-titulo">Inscripción a {evento.titulo}</h4>
    <div className="form-row">
      <FormField
        label="Nombre completo" inputRef={nombreInput} name="nombre" autoComplete="name"
        required maxLength={100} placeholder="Ingresá tu nombre y apellido"
        value={campos.nombre} disabled={enviando}
        onChange={(event) => onChange('nombre', event.target.value)}
      />
      <FormField
        label="Correo electrónico" type="email" name="email" autoComplete="email"
        required maxLength={254} placeholder="Ingresá tu correo electrónico"
        value={campos.email} disabled={enviando}
        onChange={(event) => onChange('email', event.target.value)}
      />
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Confirmando…' : 'Confirmar inscripción'}
      </Button>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>
);

export default RegistrationForm;
