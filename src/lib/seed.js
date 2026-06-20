// Plantilla de ejemplo: porta la lógica original (casa en Diego Portales / La Florida
// / Tobalaba) al nuevo sistema generalizado. Se carga la primera vez que se abre la app.

const txtDomi =
  '¿Tiene espacio en el maletero? Llevamos un coche que se pliega y una bebé con su silla, la instalación solo demora unos segundos.'
const txtAbajo =
  'Los pasajes por Diego Portales están cerrados. Hay que entrar desde Av. La Florida por calle Valle del Sol, o si no, por atrás en calle Tobalaba, donde hay un portón para entrar por San Jorge.'
const txtArriba =
  'Los pasajes por Diego Portales están cerrados. Por atrás, en calle Tobalaba, hay un portón para entrar por San Jorge. Si no, también se puede entrar desde Av. La Florida por calle Valle del Sol.'
const txtTarde =
  'Los pasajes por Diego Portales están cerrados. Hay que entrar desde Av. La Florida por calle Valle del Sol. (Por atrás, en calle Tobalaba, hay un portón que a veces, a esta hora, también está cerrado).'
const txtNoche =
  'Los pasajes por Diego Portales están cerrados. Hay que entrar desde Av. La Florida por calle Valle del Sol. (Por Tobalaba, a esta hora, debería estar cerrado). Hay que ir por Escarcha y luego por la entrada de San Jorge.'

export function buildSeedTemplate() {
  return {
    id: 'seed-mi-casa',
    name: 'Mi casa',
    greeting: 'Hola.',
    fields: [
      {
        id: 'horario',
        label: 'Horario',
        type: 'select',
        autoTime: true,
        options: [
          { value: 'normal', label: 'Antes de las 22:00', fromMin: 360 },
          { value: 'tarde', label: 'Entre 22:00 y 23:00', fromMin: 1310 },
          { value: 'noche', label: 'Después de las 23:00', fromMin: 1370 },
        ],
      },
      {
        id: 'origen',
        label: '¿Por dónde viene el conductor?',
        type: 'select',
        options: [
          { value: 'abajo', label: 'Desde abajo (Av. La Florida)' },
          { value: 'arriba', label: 'Desde arriba (Tobalaba)' },
        ],
      },
      {
        id: 'domi',
        label: '🍼 Viajamos con la Domi (en coche)',
        type: 'toggle',
      },
    ],
    fragments: [
      { id: 'f-domi', text: txtDomi, order: 0, conditions: [{ fieldId: 'domi', value: true }] },
      {
        id: 'f-abajo',
        text: txtAbajo,
        order: 1,
        conditions: [
          { fieldId: 'horario', value: 'normal' },
          { fieldId: 'origen', value: 'abajo' },
        ],
      },
      {
        id: 'f-arriba',
        text: txtArriba,
        order: 2,
        conditions: [
          { fieldId: 'horario', value: 'normal' },
          { fieldId: 'origen', value: 'arriba' },
        ],
      },
      { id: 'f-tarde', text: txtTarde, order: 3, conditions: [{ fieldId: 'horario', value: 'tarde' }] },
      { id: 'f-noche', text: txtNoche, order: 4, conditions: [{ fieldId: 'horario', value: 'noche' }] },
    ],
  }
}
