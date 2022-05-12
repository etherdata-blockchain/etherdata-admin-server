// @flow
import * as React from "react";
import { MuiForm5 } from "@rjsf/material-ui";
import { schema } from "../../../internal/handlers/add_user_handler";
import { interfaces } from "@etherdata-blockchain/common";
import { ReactJsonFormContext } from "../../../model/ReactJsonFormProvider";

type Props = {
  onClose(data: interfaces.db.StorageUserDBInterface): void;
  onSubmit(data: interfaces.db.StorageUserDBInterface): Promise<void>;
  userInfo?: interfaces.db.StorageUserDBInterface;
};

/**
 * Will display user info data in a UI view
 * @param props
 * @constructor
 */
export function UserInfoPanel(props: Props) {
  const { setIsLoading, formButton } = React.useContext(ReactJsonFormContext);
  const [formData, setFormData] = React.useState(props.userInfo);

  const onSubmit = React.useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      await props.onSubmit(data);
    } catch (e) {
      window.alert(`${e}`);
    } finally {
      setIsLoading(false);
      props.onClose(data);
    }
  }, []);

  return (
    <MuiForm5
      schema={schema}
      formData={formData}
      onSubmit={async (data) => {
        await onSubmit(data.formData);
      }}
    >
      <button ref={formButton} type="submit" style={{ display: "none" }} />
    </MuiForm5>
  );
}
