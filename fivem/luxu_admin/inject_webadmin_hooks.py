"""Inyecta en luxu_admin/server/index.js los hooks que usa server/webadmin.js (panel web de valenciapd.es/admin).

Uso:  python3 inject_webadmin_hooks.py ruta/a/luxu_admin/server/index.js
Es idempotente: si ya están inyectados, no hace nada. Vuelve a ejecutarlo después de actualizar luxu_admin.

Los hooks solo exponen en globalThis.__vpdWeb funciones que ya existen en luxu (las mismas que usa su panel
externo de luxu.app). No cambian el comportamiento del menú dentro del juego.
"""
import sys

W = "(globalThis.__vpdWeb??={cbs:new Map})"

HOOKS = [
    # 1. Registro de todos los callbacks del servidor (listas de baneos, staff, estadísticas...)
    ("function registerServerCallback(eventName,cb,latent=!1,latentBps=defaultBps){",
     "function registerServerCallback(eventName,cb,latent=!1,latentBps=defaultBps){" + W + ".cbs.set(eventName,cb);"),
    # 2. Staff virtual del panel web: solo lo ve getStaff() mientras dura una petición
    ("function getStaff(source2){return onlineStaff.get(source2)??null}",
     "function getStaff(source2){return globalThis.__vpdWeb?.virtual?.get(Number(source2))??onlineStaff.get(source2)??null}"),
    # 3. Manejadores del panel externo (getPlayers, observar, reportes, consola, recursos...)
    ("webPanel=new ExternalConnection}",
     "webPanel=new ExternalConnection," + W + ".webPanel=webPanel}"),
    # 4. Acciones del menú y comprobación de permisos de luxu
    ("actions_default=actions}",
     "actions_default=actions," + W + ".actions=actions," + W + ".hasPermission=hasPermission}"),
    # 5. Acciones sobre jugadores offline
    ("}};Object.entries(actions2).forEach(",
     "}};" + W + ".offline=actions2;Object.entries(actions2).forEach("),
    # 6. Señalización WebRTC hacia visores externos (observar pantalla)
    ("notifyExternalViewer=null;",
     "notifyExternalViewer=null;" + W + ".setSignalHandler=h=>{notifyExternalViewer=h};"),
]


def main(path: str) -> None:
    src = open(path, encoding="utf-8").read()
    if "__vpdWeb" in src:
        print("Hooks ya inyectados, nada que hacer.")
        return
    for old, new in HOOKS:
        count = src.count(old)
        if count != 1:
            raise SystemExit(f"No se encontró un punto de inyección único ({count}): {old[:60]}")
        src = src.replace(old, new)
    open(path, "w", encoding="utf-8").write(src)
    print(f"{len(HOOKS)} hooks inyectados.")


if __name__ == "__main__":
    main(sys.argv[1])
