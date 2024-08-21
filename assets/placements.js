"use strict";

var placementIds = {
  landingPlacement: "d5da0e8b-b119-46dd-9040-5bc63a516cda",
  productPlacement: "d45ed3fe-ba37-4841-8fc0-ef5791faf03f",
  cartPlacement: "a2a82ae0-aaaf-40b7-9fd0-bf87817864da",
  categoryPlacement: "c79a1422-a825-4ba8-be25-39bfacef184b",
  dashboardPlacement: "0f4557b0-ea1a-4b7a-ae75-30c0d1334254",
  homepagePlacement: "756e19b3-a232-464f-8f06-97f3d2128228",
  searchPlacement: "46f49aac-8a27-4928-a6a7-2ac0102b77aa",
  bannerPlacement: "143719f0-ffd1-4d7e-9882-920066819098",
  checkoutPlacement: "5edadc7c-fb67-488d-9ce3-60285dcb1d73",
  loyaltyPlacement: "028f7b6b-8b54-4a92-8cea-27b4f1db414c",
  footerPlacement: "e225f5b0-d87b-4995-a748-2e38226f5e0d",
  bagPlacement: "d3dd6d8e-6869-47c0-8bcd-8843d2b7dcec",
  headerPlacement: "f8bf9e13-36e3-419e-ad82-6d1a2205d425",
};

const accessToken = "";
const shopName = "65d726-e1";
const apiVersion = "2021-04";

const fetchShopify = async (url, options) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

const getUserList = async () => {
  const userUrl = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/customers.json`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  };
  return await fetchShopify(userUrl, options);
};

const getUserMetafields = async (userId) => {
  const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/customers/${userId}/metafields.json`;
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  };
  return await fetchShopify(url, options);
};

const updateMetafield = async (metafieldId, updatedMetafield) => {
  const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/metafields/${metafieldId}.json`;
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify(updatedMetafield),
  };
  return await fetchShopify(url, options);
};

const updateUserMetafieldInfo = async () => {
  try {
    const userData = await getUserList();
    console.log("userInfo:", userData);

    const userId = userData.customers[0].id;
    const metafieldsData = await getUserMetafields(userId);
    console.log("User Metafields:", metafieldsData.metafields[0].id);

    const metafieldId = metafieldsData.metafields[0].id;
    const updatedMetafield = {
      metafield: {
        id: metafieldId,
        value: "1111",
        value_type: "single_line_text_field",
      },
    };

    const updateResponse = await updateMetafield(metafieldId, updatedMetafield);
    console.log("updateResponse:", updateResponse);
  } catch (error) {
    console.error("error:", error);
  }
};

window.BreadPayments.on("CARD:RECEIVE_APPLICATION_RESULT", (cardResult) => {
  switch (cardResult.result) {
    case "APPROVED":
      updateUserMetafieldInfo();
      var url =
        document.querySelector(".plccCallbackUrl").dataset.plcccallbackurl;
      var currentURL = window.location.href.toUpperCase();
      if (currentURL.indexOf("CHECKOUT") >= 0) {
        var custData = rtps.getCustomerData();
        cardResult.custData = JSON.stringify(custData);
        cardResult.updateBilling = true;
      }
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardResult),
      })
        .then((response) => response.json())
        .then((data) => {
          document.querySelector("#plccApproved").dataset.plccapproved = "true";
        })
        .catch((err) => console.log(err));
      break;
    case "PENDING":
      break;
    case "ACCOUNT_EXISTS":
      break;
    case "DECLINED":
      break;
    case "ERROR":
      break;
  }
});

window.BreadPayments.on("CARD:CLOSE_OVERLAY", (cardResult) => {
  var approved = document.querySelector("#plccApproved")?.dataset?.plccapproved;
  if (approved == "true") {
    var currentURL = window.location.href.toUpperCase();
    if (currentURL.indexOf("CHECKOUT") >= 0) {
      var redirectUrl =
        document.querySelector("#plccBillingUrl").dataset.plccbillingurl;
      window.location.href = redirectUrl;
    }
  }
});

BreadPayments.on("CARD:*", function (data) {
  console.log(this.event, data);
});

const createPlacement = (type, id, domID) => ({
  financingType: "card",
  locationType: type,
  placementId: id,
  domID: domID,
  order: {
    totalPrice: document.querySelector("#plccTotalGrossPrice")?.dataset
      .plcctotalgrossprice,
  },
});

const allPlacements = [
  createPlacement(
    "cart",
    placementIds.cartPlacement,
    "bread-payments-cart-placement"
  ),
  createPlacement(
    "product",
    placementIds.productPlacement,
    "bread-payments-product-placement"
  ),
  createPlacement(
    "landing",
    placementIds.landingPlacement,
    "bread-payments-landing-placement"
  ),
  createPlacement(
    "category",
    placementIds.categoryPlacement,
    "bread-payments-category-placement"
  ),
  createPlacement(
    "dashboard",
    placementIds.dashboardPlacement,
    "bread-payments-dashboard-placement"
  ),
  createPlacement(
    "homepage",
    placementIds.homepagePlacement,
    "bread-payments-homepage-placement"
  ),
  createPlacement(
    "search",
    placementIds.searchPlacement,
    "bread-payments-search-placement"
  ),
  createPlacement(
    "banner",
    placementIds.bannerPlacement,
    "bread-payments-banner-placement"
  ),
  createPlacement(
    "checkout",
    placementIds.checkoutPlacement,
    "bread-payments-checkout-placement"
  ),
  createPlacement(
    "loyalty",
    placementIds.loyaltyPlacement,
    "bread-payments-loyalty-placement"
  ),
  createPlacement(
    "footer",
    placementIds.footerPlacement,
    "bread-payments-footer-placement"
  ),
  createPlacement(
    "bag",
    placementIds.bagPlacement,
    "bread-payments-bag-placement"
  ),
  createPlacement(
    "header",
    placementIds.headerPlacement,
    "bread-payments-header-placement"
  ),
];

var rtps = {
  getCustomerData: function () {
    var billingAddressForm = document.querySelector(
      "#dwfrm_billing .billing-address"
    );
    var customerData = {};
    customerData.firstName =
      billingAddressForm.querySelector("#billingFirstName").value;
    customerData.lastName =
      billingAddressForm.querySelector("#billingLastName").value;
    customerData.email = document.querySelector(
      ".billing .order-summary-email"
    ).textContent;
    customerData.phone = document.querySelector(
      ".billing .order-summary-phone"
    ).textContent;
    customerData.address1 =
      billingAddressForm.querySelector("#billingAddressOne").value;
    customerData.address2 =
      billingAddressForm.querySelector("#billingAddressTwo").value;
    customerData.country = "US";
    customerData.state =
      billingAddressForm.querySelector("#billingState").value;
    customerData.city = billingAddressForm.querySelector(
      "#billingAddressCity"
    ).value;
    customerData.zip =
      billingAddressForm.querySelector("#billingZipCode").value;
    return customerData;
  },
  checkCustomerData: function (customerData) {
    return (
      customerData.firstName &&
      customerData.lastName &&
      customerData.email &&
      customerData.phone &&
      customerData.address1 &&
      customerData.state &&
      customerData.city &&
      customerData.zip
    );
  },
  initialize: function () {
    const listener = function () {
      const iframes = document.querySelectorAll(".js-iframe");
      if (
        document.activeElement === iframes[0] ||
        document.activeElement === iframes[1] ||
        document.activeElement === iframes[2]
      ) {
        document.querySelector("#paymentMethodsList").click();
      }
      window.removeEventListener("blur", listener);
    };
    window.addEventListener("blur", listener);

    document.body.addEventListener("click", function (event) {
      if (event.target.matches("#paymentMethodsList, .continue-to-payment")) {
        var rtpsSubmitted =
          document.querySelector("#rtpsRequestSent").dataset.rtpsrequestsent;
        var env =
          document.querySelector("#plccEnvironment").dataset.plccenvironment ||
          "PROD";
        if (!rtpsSubmitted) {
          var customerData = rtps.getCustomerData();
          if (rtps.checkCustomerData(customerData)) {
            var zip = customerData.zip.split("-");
            BreadPayments.setup({
              ebp: true,
              loyaltyID: "",
              env: env,
              storeNumber: "99996",
              buyer: {
                givenName: customerData.firstName || "",
                familyName: customerData.lastName || "",
                additionalName: "",
                email: customerData.email || "",
                phone: customerData.phone || "",
                billingAddress: {
                  address1: customerData.address1 || "",
                  address2: customerData.address2 || "",
                  country: customerData.country || "",
                  locality: customerData.city || "",
                  region: customerData.state || "",
                  postalCode: zip[0],
                },
              },
            });
            BreadPayments.submitRtps({
              financingType: "card",
              channel: "",
              subchannel: "",
              locationType: "checkout",
            });
            document.querySelector("#rtpsRequestSent").dataset.rtpsrequestsent =
              "true";
          }
        }
      }
    });
  },
};

rtps.initialize();
window.BreadPayments.registerPlacements(allPlacements);
