## 1. Introducción
Esta guía tiene como propósito explicar y detallar las funcionalidades y estructura de este proyecto, de manera que se entiendan los objetivos y procedimientos del mismo.

## 2. Descripción del proyecto y visión general

Este proyecto abarca unos objetivos determinados, siendo los más destacados:
- Cargar y visualizar modelos en 3D en formato VTP que correspondan a coronarias.
- Cargar un grafo correspondiente a la geometría 3D para leer valores relacionados a la misma.
- Interacción con los modelos a través de clics, brindando información de atributos (*FFR*, *WSS*, diámetro, *HSR* o *CDP*).
- Realizar análisis de rutas/ramas entre la selección de dos puntos, uno de inicio y otro de fin, mostrando gráficas interactivas con la información en detalle.
- Alternar entre diferentes modos de visualización, por ejemplo *iFR* y *WSS*.

## 3. Requisitos

#### 3.1. Requisitos funcionales
- El sistema permitirá visualizar geometrías en 3D acompañado de un grafo.
- El usuario podrá medir distintos valores en la geometría (*FFR*, diámetro, *HSR*, *CDP*, *iFR*, distancia)
- El sistema mostrará valores *FFR*/*iFR* y diámetro en una gráfica interactiva, generada a partir de una ruta creada por el usuario a través de dos clicks a lo largo de la geometría.
- El usuario podrá calcular el porcentaje de estenosis a partir de la selección de dos puntos en la geometría.
#### 3.2. Requisitos no funcionales
- La aplicación debe ser compatible con la mayoría de navegadores modernos como Chrome, *Firefox*, *Safari*, *Edge* y *Opera*.
- La aplicación debe responder a las interacciones del usuario de manera fluida.
- Aunque no se haya planteado la posibilidad de llevar esta aplicación a una pantalla móvil, esta debe ser responsive y capaz de adaptarse a cualquier pantalla (de escritorio, al menos).
- La arquitectura de la aplicación y su código debe permitir la posibilidad de continuar integrando nuevos módulos y funcionalidades sin afectar el rendimiento del sistema.
#### 3.3. Dependencias
Las dependencias que se aplican activamente en este proyecto son las siguientes:
- [chart.js](https://www.chartjs.org/) - permite la generación de gráficos utilizando Canvas.
- [graphology (y el resto de sus subdependencias)](https://graphology.github.io/) - lectura de grafos.
- [vtk.js](https://kitware.github.io/vtk-js/index.html) - permite la visualización de las geometrías en 3D.
- [ml-savitzky-golay](https://www.npmjs.com/package/ml-savitzky-golay) - se encarga de aplicar suavizado a las series de datos obtenidas de los cálculos de FFR y diámetros.

## 4. Interfaz de usuario

![Pasted image 20250307115655](https://github.com/user-attachments/assets/74e1004b-bba3-4442-bb7c-ddb417da9aa4)

1. **Home** - Redirige a la página de inicio
2. **FFR** - Aplica el método cHandleFFR()
3. **WSS** - Aplica el método cHandleWSS()
4. **FFR** (checkbox) - activa la captura de clicks para medir *FFR/iFR*
5. **Diameter** (checkbox) - activa la captura de clicks para medir diámetro
6. **Stenosis %** - activa la captura de clicks para medir el porcentaje de este nosis
7. **Clear labels** - limpia el widget base generada por un click derecho de la escena
8. **Escena** - Aqui se encuentra la geometria en 3D
9. **Escala de colores** - Resultado del componente **ColorScale.js** (explicado en el siguiente punto)
10. (No se ve en esta captura) **Toggle calcium** - Despliega el calcio sobre la geometria si está disponible el archivo STL. 
## 4. Arquitectura y estructura del proyecto
El proyecto emplea una arquitectura *SPA* (Single Page Application) en React, por si se requiere crear componentes adicionales poder crearlos e integrarlos con facilidad.
- **/public** - contiene recursos estáticos que se importan en la interfaz (por ejemplo, imágenes, archivos, fuentes)
- **/components** - agrupa componentes complejos de la interfaz de usuario que son independientes a la página principal
	- **ChartModal.js** - El modal en el que está contenido el gráfico de líneas.
	- **LineChart.js** - Define la configuración para la representación del gráfico de líneas.
	- **ErrorModal.js** - Modal que sirve para controlar errores, a modo de *warning*.
	- **ColorScale.js** -  Una escala vertical de colores que puede tomar diferentes valores (por los momentos, están definidos para *FFR*, *iFR* y *WSS*), según los [props](https://react.dev/learn/passing-props-to-a-component) que se le pasen al componente.
- **/pages** - almacena vistas completas de forma independiente, facilitando la separación de las funcionalidades de cada una.
	- **ModelViewer.js** - página principal de la aplicación, aquí se visualizan las geometrías.
		- **clearRightLabel()** - Elimina el widget generado a partir de click derecho. Oculta el texto, eliminar el widget, limpia los callbacks asociados y finalmente vuelve a renderizar la escena.
		- **createSVGRepresentation**() - Configura una representación SVG para un widget. Utiliza el estado del widget para generar elementos gráfico s (como un rectángulo de fondo, texto, figuras geométricas).
		- **addSphereWithLabel**() - Añade un actor (en este caso, una esfera) a la escena en 3D en una posición dada.
		- **handleFFRChange()** - Controla el cambio en el checkbox que está asociado a activar la medida de *FFR*. Actualiza el estado de `isFFRChecked` y si se activa, desactiva el checkbox de Diameter para ajustar la visualización en función de ese modo.
		- **handleRadiusChange()** - Similar al método anterior, pero actualiza el estado de `isRadiusChecked` y desactiva el modo *FFR* si se activa.
		- **handleStenosisPercentage()** - Activa el modo de captura para calcular el porcentaje de estenosis. Cambia el estado para comenzar a acumular clics y deshabilita el botón correspondiente durante el proceso.
		- **toggleModal()** - Alternado el estado de apertura/cierre del modal que muestra el gráfico de líneas, modificando el estado de `isModalOpen`.
		- **handleHome()** - Navega a la página principa utilizando el hook `useNavigate` de React Router
		- **posToNodes()** - Dada una posición en 3D, busca en el grafo previamente cacheado el nodo más cercano a esa posición. Si la distancia es menor a un umbral definido, devuelve el nodo; de lo contrario, retorna `null`
		- **getClickAttributes()** - A partir de una posición de un click previo, busca y retorna los atributos del nodo más cercano en el grafo cacheado.
		- **fetchGraphAndProcessNodes()** - Procesa el grafo cacheado para identificar nodos correspondientes a ciertos valores (por ejemplo, donde está '*LAD*', '*RI*', '*PLA*', etc.). Para cada grupo/cadena, añade un widget que se posiciona en el punto medio del grupo y añade un listener para limpiar dichas etiquetas al interactuar.
		- **cHandleClasses()** - Llama a la función anterior para activar la visualización de clases y actualiza el estado correspondiente para reflejar que esta funcionalidad está activa.
		- **buildChartFromResult()** - A partir de los datos resultantes del cálculo de la ruta más corta, construye el objeto de datos y las opciones de configuración para el gráfico de líneas. Aplica un filtro de suavizado (Savitzky-Golay) a los valores, calcula distancias acumuladas y genera un conjunto de etiquetas para el modal en el que se muestra este gráfico.
		- **handleOpenModal()** - Se activa cuando se han acumulado dos clicks en la escena. Calcula la ruta más corta entre los dos puntos seleccionados llamando a `calculateShortestPath`, almacen el resultado y llama a `buildChartFromResult` para preparar y abrir el modal con el gráfico.
		- **calculateShortestPath()** - Calcula la ruta más corta entre dos posiciones en la escena. Para lograr esto, busca los dos nodos más cercanos a las posiciones obtenidas de los clicks (llamando a `posToNodes`), y aplica un algoritmo bidireccional no ponderado.
		- **calculateStenosisPercentage()** - Calcula el porcentaje de estenosis comparando los radios de dos nodos (obtenidos a partir de dos posiciones). Se realiza una relación entre los radios para determinar la reducción y se actualiza la interfaz mostrando el resultado.
		- **cHandleSTL()** - Se utiliza para cargar un modelo en formato `.stl` a la escena, normalmente este modelo contiene la representación del calcio.
		- **cHandleWSS()** - Actualiza la  visualización del actor para mostrar información de WSS (Wall Shear Stress). Cambia los valores escalares activos a '*WSS*', para que a partir de esos valores se apliquen colores a la geometría a través de una lookup table para representar adecuadamente los valores del *WSS*.
		- **cHandleFFR()** - Similar a `cHandleWSS`, esta función actualiza el actor para visualizar el parámetro *FFR_Corrected*. Dependiendo del modelo (por ejemplo, si se está visualizando *iFR*), se configura una lookup table específica, y se actualiza la visualización en consecuencia.
	- **ModelSelector.js** - página a la que se es redirigido por defecto al iniciar la aplicación, aquí se selecciona el modelo a visualizar.
- **App.js** - se trata del componente raíz que integra el router y la aplicación
- **index.js** - punto de entrada de la aplicación
## 5. Estrategia de desarrollo
Para los métodos y variables, se utiliza *[camelCase](https://en.wikipedia.org/wiki/Camel_case)*, para las clases CSS se emplea [*kebab-case*](https://developer.mozilla.org/en-US/docs/Glossary/Kebab_case).
## 6. Otras versiones
Además de esta versión que es de uso interno, también se encuentra una versión "demo" publicada en ***GitHub Pages*** a la que se puede acceder haciendo clic [aquí]().
## 7. Ejecución y despliegue
Este proyecto al estar generado con **create-react-app** (y por ende, con **npm**), se puede ejecutar en modo de desarrollo ejecutando el comando `npm start`, y también podemos generar una build para producción usando `npm run build` y probar la misma ejecutando el comando `npx serve -s build -l 80`, ejecutando este comando se desplegara en **localhost**. OJO: `node.js` y `npm` deben estar instalados en el equipo.

Otra de las maneras es usando los `.bat` en la carpeta raiz del proyecto, esto ejecutará el script/back-end que lee los datos de pacientes a través de un path especificado. Para modificar este path, nos dirigimos a la carpeta `back-end`, y abrimos el archivo `app.py`: y buscamos esta línea:

```python
MODELS_FOLDER = os.path.join(f'Z:/#AGUSTIN/CAL_8/7_Visualizador')**
```

Mucho ojo, al especificar el path, hay que apuntar siempre al directorio con la siguiente estructura:

![Pasted image 20250314120013](https://github.com/user-attachments/assets/390fb76e-9ab1-4c71-9551-ac14cd44fb14)


Dentro de FFR están el set de archivos necesarios para usar en esta herramienta, con lo cuál siempre apuntamos al path anterior al de ese directorio, supongamos:

**CAL_8 / 7_Visualizador (este es al que tenemos que apuntar) / FFR (aqui es donde estan nuestros archivos)**
Entonces, al ejecutar el script y se abra nuestro navegador lo primero que veremos será lo siguiente:

![Pasted image 20250314122417](https://github.com/user-attachments/assets/f5b5b195-ba47-41c8-8af9-577bb2640388)


Ojo, si tuvieramos un directorio a la misma altura con nombre de 'iFR', también se listaría en esta pantalla.

## 8. Anexos 
- Repositorio de [GitHub]()
- [Demo](https://flowreserve.github.io/visualizador-demo/) de esta aplicación
## 9. Recursos de interés
- En caso de no saber *React* - [react.dev](https://react.dev/learn)
- Para aprender a usar *vtk.js* - [kitware.github.io/vtk-js](https://kitware.github.io/vtk-js/docs/)
