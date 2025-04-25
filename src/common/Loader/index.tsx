import { LoadingOverlay } from "@mantine/core";

const Loader = () => {
  return (
    <LoadingOverlay
         visible={true}
         zIndex={1000}
         overlayProps={{ radius: 'sm', blur: 2 }}
         loaderProps={{ color: '#FF5D14', type: 'dots' }}
       />
  );
};

export default Loader;
