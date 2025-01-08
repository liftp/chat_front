interface RouteSettings {
    dynamic: boolean,
    defaultRoutes: Array<string>
    thridLevelRouteCache: boolean
}

const routeSettings: RouteSettings = {
    dynamic: true,
    defaultRoutes: ["USER"],
    thridLevelRouteCache: false
}

export default routeSettings