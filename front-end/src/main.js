// 1. Cargar el modelo STL
const stlReader = vtk.STLReader.newInstance();
stlReader.setUrl('Paciente.stl').then(() => {
  // Se carga correctamente, ahora se puede agregar al renderizador
  const actor = vtk.Actor.newInstance();
  actor.setMapper(stlReader.getOutputPort(0).getMapper());
  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();
});

// 2. Agregar un observador de eventos de clic
renderWindow.getInteractor().onLeftButtonPress((ev) => {
  // 3. Obtener coordenadas del clic
  const [x, y] = ev.position;

  // 4. Mapear coordenadas a puntos en el modelo
  const picker = vtk.PointPicker.newInstance();
  picker.initializePickList();
  picker.addActor(actor);
  picker.pickFromListOn();
  picker.setPickFromList(true);
  picker.setRenderer(renderer);
  picker.pick(x, y, 0, renderer);

  // 5. Mostrar las coordenadas o realizar acciones adicionales
  const pickedPoints = picker.getPickedPositions();
  if (pickedPoints && pickedPoints.length > 0) {
    // Mostrar las coordenadas del punto seleccionado
    console.log('Coordenadas del punto seleccionado:', pickedPoints[0]);
  }
});
