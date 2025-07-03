import { useState } from "react";
import { useAnimateCamera } from "../../utils/camera/cameraUtils";
import CustomButton from "../global/CustomButton";
import "./CustomCameraPlacement.css";

const CameraInputPanel = () => {
  const { animateCameraToPosition } = useAnimateCamera();

  const [cameraPosition, setCameraPosition] = useState({ x: '', y: '', z: '' });
  const [focalPoint, setFocalPoint] = useState({ x: '', y: '', z:'' });
  const [viewUp, setViewUp] = useState({ x: '', y: '', z: '' });

  const handleChange = (setter) => (axis) => (e) => {
    setter((prev) => ({ ...prev, [axis]: e.target.value}));
  };

  const handleVisualize = () => {
    animateCameraToPosition(
      [cameraPosition.x, cameraPosition.y, cameraPosition.z],
      [focalPoint.x, focalPoint.y, focalPoint.z],
      [viewUp.x, viewUp.y, viewUp.z]
    );
  };

  const renderInputs = (label, state, setter) => (
    <div>
      <h4>{label}</h4>
      <div>
          <label>
            X: <input type="number" value={state.x} onChange={handleChange(setter)("x")} />
          </label>
      </div>
      <div>
          <label>
            Y: <input type="number" value={state.y} onChange={handleChange(setter)("y")} />
          </label>
      </div>
      <div>
          <label>
            Z: <input type="number" value={state.z} onChange={handleChange(setter)("z")} />
          </label>
      </div>
    </div>
  );

  return (
    <div className="custom-camera-position-component">
      {renderInputs("Posición de Cámara", cameraPosition, setCameraPosition)}
      {renderInputs("Punto Focal", focalPoint, setFocalPoint)}
      {renderInputs("Vector ViewUp", viewUp, setViewUp)}

      <CustomButton onClick={handleVisualize} text={"Visualizar"}/>
    </div>
  );
};

export default CameraInputPanel;
