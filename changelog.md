## CHANGELOG


### V-1.0.1 02/07/2025 
- Cambios en los textos de las gráficas del pullback, modificados de inglés a español.
- Cambios en las leyendas de las gráficas del pullback, modificados textos.
- Actualizado el diccionario para generar nuevos segmentos coronarios.

### V-1.0.0 26/05/2025
- Ajuste en las Tags informativas para mejorar la interfaz de usuario, y la visibilidad.
- Añadido botón `centrar` para centrar la vista del modelo 3D.
- Añadido botón dentro del chart para `exportar datos` (Imagen modelo 3D y gráfica bajo un mismo zip).
- Añadido botón `cerrar` para minimizar el chart generado tras obtener información entre 2 puntos.
- Añadida sección modal para **mostrar/ocultar** 2 nuevos botones de acción de depuración: `añadir punto` y `posición de cámara`
- Añadido botón de `vistas` preconfiguradas para visualizar el modelo 3D.
- Añadido botón `crear informes` (Obtiene varias vistas del modelo 3D y genera un zip con la imagen de cada vista + chart asociado).
- Mejoras en la estructura interna del proyecto.


### 22/01/2025

- Se han corregido colores de la referencia de valores de FFR e iFR.

#### 20/01/2025

- Se ha creado el archivo 'CHANGELOG.MD'
- Se han corregido discrepancias de los valores de FFR entre el gráfico de líneas y las etiquetas de la geometría.
- Se han cambiado los valores de radio a diámetro (radio*2).
- Se han implementado funcionalidades para intercalar entre FFR e iFR. Entre ellas:
        - Visualizar valores de iFR en la geometría con el uso de una paleta de colores.
        - Medir ramas de la geometría, y comprobar en detalle los valores utilizando un gráfico de líneas interactivo (iFR, diámetro y posición de la rama en milímetros), en dicho gráfico también están simbolizados los valores de riesgo (0.90, o inferior).
- Se han aplicado cambios en el script de ejecución (start.bat) para ejecutar un entorno de pre-producción.


 