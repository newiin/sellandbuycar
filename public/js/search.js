var client = algoliasearch('T0Q2S0R1MH', '8d1b67e13d4006724e072d0f9d0c13c3');
var index = client.initIndex('Vehiclechema');
//initialize autocomplete on search input (ID selector must match)
autocomplete('#aa-search-input', { hint: false }, {
    source: autocomplete.sources.hits(index, { hitsPerPage: 10 }),
    //value to be displayed in input control after user's suggestion selection
    displayKey: 'name',
    //hash of templates used when rendering dataset
    templates: {
        //'suggestion' templating function used to render a single suggestion
        suggestion: function(suggestion) {
            return '<a href="/details/' + suggestion.objectID + '"><span>' +
                suggestion._highlightResult.title.value + '</span><a/>';
        }
    }
});