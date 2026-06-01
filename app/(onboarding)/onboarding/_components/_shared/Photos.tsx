import Alert from "@/_design_system/Alert";
import PhotoUpload from "@/_design_system/PhotoUpload";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { Photo } from "@/_models/photo";
import { ReactNode } from "react";

const Photos = ({
  photos,
  setPhotos,
  max,
  minDimensions,
  subtitle,
  body,
  tip,
  error,
}: {
  photos?: Photo[];
  setPhotos?: (files: Photo[]) => void;
  max: number;
  minDimensions?: {
    width: number;
    height: number;
  };
  subtitle: string;
  body: string;
  tip?: ReactNode;
  error?: string;
}) => {
  return (
    <Stack gap="16px">
      <TextBlock subtitle={subtitle} body={body} />
      {error && <InputError error={error} />}
      <StackHalfHalf reverse={!!tip} rightEmpty={!tip}>
        {!!tip && (
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            title="Dica"
            text={tip}
          />
        )}
        <PhotoUpload
          photos={photos}
          onChangePhotos={setPhotos}
          max={max}
          minDimensions={minDimensions}
          showFirstAsCover
          invalid={!!error}
        />
      </StackHalfHalf>
    </Stack>
  );
};

export default Photos;
