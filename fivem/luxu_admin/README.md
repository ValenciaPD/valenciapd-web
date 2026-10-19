# Panel web de staff dentro de luxu_admin

El panel de `valenciapd.es/admin` habla directamente con `luxu_admin` (no hay recurso aparte).
Estos son los únicos archivos añadidos o cambiados en el recurso:

| Archivo | Qué hace |
| --- | --- |
| `server/webadmin.js` | API del panel: recoge las peticiones del buzón MySQL `luxu_admin_webadmin_queue` (y también por HTTP en `/luxu_admin/webadmin/*` si el puerto fuera accesible). Firma HMAC, lista blanca de operaciones con su permiso de luxu, validación de datos, retransmisión de pantalla. |
| `server/index.js` | 6 *hooks* mínimos (con `inject_webadmin_hooks.py`) que exponen los manejadores que ya usa el panel externo oficial de luxu. No cambian nada del menú en el juego. |
| `fxmanifest.lua` | Añade `'server/webadmin.js'` a `server_scripts`, justo después de `'server/index.js'`, y `'ox_lib'` a `dependencies` (así ox_lib siempre arranca antes). |
| `config/webadmin.json` | `{"enabled": true, "secret": "..."}`. El secreto es el mismo que `FIVEM_API_SECRET` en Vercel. No se envía a los jugadores (no está en `files`). |

## Conexión con la web

El hosting no deja que Vercel conecte con el servidor de FiveM, así que la web deja cada petición firmada en la tabla
`luxu_admin_webadmin_queue` (la crea luxu al arrancar) y luxu la recoge cada 150-400 ms. En Vercel hacen falta:

- `FIVEM_API_SECRET`: igual que `secret` en `config/webadmin.json`.
- `FIVEM_DB_URL`: `mysql://usuario:contraseña@82.41.119.3:3306/base` (la misma base de datos que usa el servidor).

Diagnóstico: `https://www.valenciapd.es/api/admin/diag` (`result: ok` = todo conectado).

## Seguridad

- Cada petición va firmada con HMAC-SHA256 (`X-VPD-Timestamp`, `X-VPD-Signature`), caduca a los 60 s y no se puede reutilizar.
- La web solo deja entrar a quien tenga uno de los roles de staff en Discord; el servidor calcula el grupo de luxu
  (miembro por Discord o `discord_role_id` del grupo) y comprueba el permiso de luxu de cada operación.
- Se valida `target`/`targets` (en FiveM `-1` significa "todos los jugadores"), cantidades, horas y longitudes.
- Desde la web no se pueden gestionar grupos ni miembros de rango igual o superior al propio.
- Las acciones pasan por los manejadores de luxu, que comprueban jerarquía y guardan el log de staff.

## Al actualizar luxu_admin

1. Copia de nuevo `server/webadmin.js` y `config/webadmin.json`.
2. Ejecuta `python3 inject_webadmin_hooks.py ruta/a/luxu_admin/server/index.js`.
3. Vuelve a añadir `'server/webadmin.js'` en `server_scripts` del `fxmanifest.lua`.
4. `restart luxu_admin`. En la consola debe salir `[webadmin] Panel web activo. Hooks: acciones=true ...`.

Al arrancar, el recurso escribe `webadmin_status.json` (grupos de luxu con su rol de Discord y si los hooks cargaron).
