import { useScreenshot } from "../../utils/images/useScreenShot";
import CustomButton from "../global/CustomButton";
import { useApp } from "../../context/AppContext";
import { getIDPatient } from "../../utils/global/getIDPatient";

const ModelScreenshotButton = () => {
    const { folderPath } = useApp();
    const {captureWithSVGOverlayAndDownload } = useScreenshot();
    const idPatient = getIDPatient(folderPath);
    console.log(idPatient);
    const handleScreenshot = () => {
        captureWithSVGOverlayAndDownload(`${idPatient}_IMG`, Date.now());
    }
    return (
        <CustomButton onClick={handleScreenshot} text={"Capturar imagen"}></CustomButton>
    );
}

export default ModelScreenshotButton;