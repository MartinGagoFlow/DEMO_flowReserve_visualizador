
import { Oval } from "react-loader-spinner";
export const Spinner = () => (
    <div className="spinner">
      <Oval
        height={80}
        width={80}
        color="grey"
        ariaLabel="loading"
        secondaryColor="lightgrey"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  );
  