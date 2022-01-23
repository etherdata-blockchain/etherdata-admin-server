import { fireEvent, render } from "@testing-library/react";
import React from "react";
import WebhookPanel from "../../../../components/installation/WebhookPanel";
import { beforeUITest } from "../../../utils/ui-test";
import { configs, mockData } from "@etherdata-blockchain/common";

describe("Given a webhook panel", () => {
  beforeAll(() => {
    beforeUITest();
  });

  test("When rendering the page", async () => {
    const screen = await render(
      <WebhookPanel host={mockData.MockURL.mockHTTPURL} />
    );
    const expireField = screen.getByDisplayValue(
      configs.Configurations.defaultExpireDuration
    ) as HTMLInputElement;

    const userField = screen.getByDisplayValue(
      configs.Configurations.defaultWebhookUser
    ) as HTMLInputElement;
    const webhookField = screen.getByTestId("webhook-url") as HTMLInputElement;

    expect(expireField).toBeInTheDocument();
    expect(userField).toBeInTheDocument();
    expect(webhookField).toBeInTheDocument();
    expect(webhookField.value.length).toBeGreaterThan(0);

    const initialValue = webhookField.value;

    fireEvent.change(expireField, { target: { value: "3600" } });
    expect(expireField.value).toBe("3600");
    expect(webhookField.value).not.toBe(initialValue);

    fireEvent.change(userField, { target: { value: "abcde" } });
    expect(userField.value).toBe("abcde");
    expect(webhookField.value).not.toBe(initialValue);
  });
});
