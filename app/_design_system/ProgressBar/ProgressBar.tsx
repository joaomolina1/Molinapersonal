import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("progress-bar");

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className={block()}>
    <div style={{ width: `${progress}%` }} className={element("progress")} />
  </div>
);

export default ProgressBar;
