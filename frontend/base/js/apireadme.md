Usage:

First, create your APICollections:

    API.person = new APICollection("person");
    API.address = new APICollection("address");

Now, you can use them like this:
    
    var createPersonPromise = API.person.create({first_name: "Foo", last_name: "Bar"});
    var readAddressPromise = API.person.read(1);
    var updateAddressPromise = API.address.update(54, {user_id: 1});

Each promise defined above is fulfilled with an object representing the REST resource
being operated upon. The one below is fulfilled with null:

    var nullPromise = API.person.delete(1);

You can also "soft delete" objects (set a deleted field to true)

    var nullPromise = API.person.delete(1, true);

You can also call class an instance methods on the API (/resource/<id>/instanceMethod or /resource/classMethod)

    API.user.instanceMethod("GET", "instanceMethod", 1);
    API.user.classMethod("GET", "classMethod");

These can be attached to the API like so: 

    API.classMethod = (body) => API.user.classMethod("GET", "classMethod", body);
    API.instanceMethod = (id, body) => API.user.instanceMethod("GET", "instanceMethod", id, body)

Furthermore, you can chain API actions almost as if your networking code is synchronous.

    var promise = API.person.create({first_name: "Foo", last_name: "Bar"})
                            .then(person => API.address.create({zip_code: '76883', user_id: person.id}))
                            .then(address => API.address.update(address.id, {street: 'Software Road'}))
                            .then(address => API.address.delete(address.id))
    });