/* eslint-disable */

/* Import React modules */
import React, { useEffect, useState, useRef } from "react";
/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { TypeSDKData } from "../../common/types";
import locale from "../../common/locale/en-us";

/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

declare global {
  interface Window {
    iframeRef: any;
    postRobot: any;
  }
}
/* To add any labels / captions for fields or any inputs, use common/local/en-us/index.ts */

let url: any;

const DashboardWidget: React.FC = function () {
  const [state, setState] = useState<TypeSDKData>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });
  const ref = useRef(null);
  const [contentTypeRefLists, setContentTypeRefLists] = useState<string[]>([]);
  const [contentTypeLists, setContentTypeLists] = useState<string[]>([]);
  const [region, setRegion] = useState<string>();
  const [apiKey, setApiKey] = useState<string>();

  useEffect(() => {
    ContentstackAppSdk.init()
      .then(async (appSdk) => {
        setApiKey(appSdk.stack._data.api_key);
        setRegion(appSdk.region);
        window.iframeRef = ref?.current;
        window.postRobot = appSdk?.postRobot;
        const { stack: appSdkStack } = appSdk;
        const contentTypes = await appSdkStack?.getContentTypes("", {
          include_count: true,
          include_global_field_schema: true,
        });

        if (contentTypes?.content_types.length > 0) {
          const uniqueTitleSet = new Set<string>(); // to add unique title list
          Object.values(contentTypes?.content_types).forEach(
            (contentType: any) => {
              Object.values(contentType?.schema).forEach((schema: any) => {
                if (schema.data_type === "reference") {
                  uniqueTitleSet.add(contentType);
                }
              });
            }
          );
          setContentTypeRefLists(Array.from(uniqueTitleSet));
        }
        if (contentTypes?.content_types.length > 0) {
          let arrayOfContentList: any = [];
          Object.values(contentTypes?.content_types).forEach(
            (contentType: any) => {
              arrayOfContentList.push(contentType.uid);
            }
          );
          setContentTypeLists(arrayOfContentList);
        }

        const config = await appSdk.getConfig();
        appSdk?.location?.DashboardWidget?.frame?.enableAutoResizing?.();
        setState({
          config,
          location: appSdk.location,
          appSdkInitialized: true,
        });
      })
      .catch((error) => {
        console.error("appSdk initialization error", error);
      });
  }, []);

  const reDirect = (id: any) => {
    if (region === "NA") {
      url = `${locale.configFields.url.NA}#!/stack/${apiKey}/content-type/${id}/content-type-builder`;
    } else if (region === "EU") {
      url = `${locale.configFields.url.EU}#!/stack/${apiKey}/content-type/${id}/content-type-builder`;
    } else if (region === "AZUE-NA") {
      url = `${locale.configFields.url["AZURE-NA"]}#!/stack/${apiKey}/content-type/${id}/content-type-builder`;
    } else {
      url = `${locale.configFields.url["AZURE-EU"]}#!/stack/${apiKey}/content-type/${id}/content-type-builder`;
    }

    window.open(url, "_blank");
  };

  /* Handle your UI as per requirement. State variable will hold
  the configuration details from the appSdk. */

  return (
    <div className="layout-container" ref={ref}>
      <div className="contentType">
        <div className="contentTypeBox">
          {contentTypeRefLists.map((contentType: any) => {
            return (
              <div className="contentDiv">
                <div
                  className="contentType_head"
                  onClick={() => {
                    reDirect(contentType.uid);
                  }}
                >
                  <h2 id={contentType.uid}>
                    Content Type: <b>{contentType.title}</b>
                  </h2>
                </div>

                <div className="">
                  {contentType.schema.map((field: any) => {
                    if (field.data_type === "reference") {
                      return (
                        <div
                          key={field.uid}
                          id={field.uid}
                          className="fieldDiv"
                        >
                          <h3 className="fieldName">
                            Field name: {field.display_name}
                          </h3>
                          <div className="refList">
                            {contentTypeLists
                              .filter((item: any) =>
                                field?.reference_to.includes(item)
                              )
                              .sort((a: any, b: any) => a.length - b.length)
                              .map((commonItem: any) => (
                                <div
                                  className="common refListCommon"
                                  key={commonItem}
                                  onClick={() => {
                                    reDirect(commonItem);
                                  }}
                                >
                                  {commonItem}
                                </div>
                              ))}

                            {field?.reference_to
                              .filter(
                                (item: any) => !contentTypeLists.includes(item)
                              )
                              .sort((a: any, b: any) => a.length - b.length)
                              .map((differentItem: any) => (
                                <div
                                  className="difference refListCommon"
                                  key={differentItem}
                                >
                                  {differentItem}
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardWidget;
