import { useEffect } from "react";
import { subscribeToPanelRequests, takePanelRequest, type PanelRequest } from "./panelRequest";

export function usePanelRequests(isReady: boolean, onRequest: (request: PanelRequest) => void): void {
  useEffect(() => {
    if (!isReady) return;
    const handlePendingRequest = () => {
      takePanelRequest()
        .then((request) => {
          if (request) onRequest(request);
        })
        .catch(console.error);
    };
    handlePendingRequest();
    return subscribeToPanelRequests(handlePendingRequest);
  }, [isReady, onRequest]);
}
