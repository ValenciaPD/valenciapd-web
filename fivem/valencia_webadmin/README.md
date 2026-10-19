# valencia_webadmin

Puente entre `luxu_admin` (servidor FiveM) y el panel de staff de la web (`valenciapd.es/admin`).

- La web comprueba que el usuario de Discord tiene uno de los roles de staff.
- Este recurso calcula sus permisos con los grupos de `luxu_admin` (miembro por Discord o `discord_role_id` del grupo)
  y vuelve a comprobarlos antes de ejecutar cualquier acción.
- Las peticiones van firmadas con HMAC-SHA256, caducan a los 60 s y no se pueden reutilizar.

## Instalación

1. Copia esta carpeta a `resources/[valencia-scripts]/valencia_webadmin`.
2. En `server.cfg`, después de `ensure luxu_admin`:

   ```
   set valencia_webadmin_secret "MISMO_VALOR_QUE_FIVEM_API_SECRET_EN_VERCEL"
   ensure valencia_webadmin
   ```

3. En Vercel → Settings → Environment Variables:
   - `FIVEM_API_SECRET`: el mismo secreto (mínimo 32 caracteres).
   - `FIVEM_API_URL` (opcional): por defecto `http://83.150.218.223:30004/valencia_webadmin`.
