import JourneyRunner from "sap/fe/test/JourneyRunner";
import ListReport from "sap/fe/test/ListReport";
import ObjectPage from "sap/fe/test/ObjectPage";
import CustomGenresListGenerated from "./GenresList.gen";
import CustomGenresObjectPageGenerated from "./GenresObjectPage.gen";

const runner = new JourneyRunner({
    launchUrl: sap.ui.require.toUrl("browsegenres") + "/test/flp.html#app-preview",
    pages: {
        onTheGenresListGenerated: new ListReport(
            {
                appId: "browsegenres",
                componentId: "GenresList",
                entitySet: "",
                contextPath: "/Genres"
            },
            CustomGenresListGenerated
        ),
        onTheGenresObjectPageGenerated: new ObjectPage(
            {
                appId: "browsegenres",
                componentId: "GenresObjectPage",
                entitySet: "",
                contextPath: "/Genres"
            },
            CustomGenresObjectPageGenerated
        )
    },
    async: true
});

export default runner;
