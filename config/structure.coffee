# Read more about app structure at http://docs.appgyver.com

module.exports =

  # See styling options for tabs and other native components in app/common/native-styles/ios.css or app/common/native-styles/android.css
  tabs: [
    {
      title: "Prayers"
      id: "prayers"
      location: "impraying#prayers" # Supersonic module#view type navigation
    }
    {
      title: "Notifications"
      id: "notifications"
      location: "impraying#notifications" # Supersonic module#view type navigation
    }
  ]

  preloads: [
    {
      id: "prayer"
      location: "impraying#prayer"
    }
  ]

  initialView:
    id: "login"
    location: "impraying#login"
