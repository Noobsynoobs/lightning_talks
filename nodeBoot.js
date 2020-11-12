const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const app = express();
app.use(cors());


const manufacturers = [
    { id: 1, name: 'Ferrari', revenue: '€3,767 billion'},
    { id: 2, name: 'Lamborghini', revenue: '€586 million' },
    { id: 3, name: 'BMW', revenue: '€104.210 billion' },
    { id: 4, name: 'Mitsubishi Motors', revenue: '¥2.514 trillion' },
    { id: 5, name: 'TVR', revenue: '€3,767 Billion' },
    { id: 6, name: 'Nissan', revenue: '€3,767 Trillion' }
];

const vehicles = [
    { id: 1, name: 'TVR Tuscan Speed Six', manufacturerId: 5 },
    { id: 2, name: '3.0 CS Alpina', manufacturerId: 3 },
    { id: 3, name: 'Evolution VII', manufacturerId: 4},
    { id: 4, name: 'Murcielago LP-670 Super Veloce', manufacturerId: 2},
    { id: 5, name: 'R34 Skyline GTR Spec-V', manufacturerId: 6},
    { id: 6, name: 'E36 M3', manufacturerId: 3},
    { id: 7, name: 'E38 750i', manufacturerId: 3},
    { id: 8, name: 'L200', manufacturerId: 4},
    { id: 9, name: '550 Maranello', manufacturerId: 1 },
    { id: 10, name: '3000GT', manufacturerId: 4 }
];

const VehicleType = new GraphQLObjectType({
    name: 'Vehicle',
    description: 'This represents a vehicle manufactured by a manufacturer',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        manufacturerId: { type: GraphQLNonNull(GraphQLInt) },
        manufacturer: {
            type: ManufacturerType,
            resolve: (vehicle) => {
                return manufacturers.find(manufacturer => manufacturer.id === vehicle.manufacturerId)
            }
        }
    })
});

const ManufacturerType = new GraphQLObjectType({
    name: 'Manufacturer',
    description: 'This represents a manufacturer of a vehicle',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        revenue: {type: GraphQLString},
        vehicles: {
            type: new GraphQLList(VehicleType),
            resolve: (manufacturer) => {
                return vehicles.filter(vehicle => vehicle.manufacturerId === manufacturer.id)
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        vehicle: {
            type: VehicleType,
            description: 'A single Vehicle',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => vehicles.find(vehicle => vehicle.id === args.id)
        },
        vehicles: {
            type: new GraphQLList(VehicleType),
            description: 'List of All Vehicles',
            resolve: () => vehicles
        },
        manufacturers: {
            type: new GraphQLList(ManufacturerType),
            description: 'return a  list of all car manufacturers',
            resolve: ()  => manufacturers
        },
        manufacturer: {
            type: ManufacturerType,
            description: 'A single manufacturer',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => manufacturers.find(manufacturer => manufacturer.id === args.id)
        },
    })
});

const RootMutationType = new GraphQLObjectType( {
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addVehicle: {
            type: VehicleType,
            description: 'Add a vehicle',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                manufacturerId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const vehicle = { id: vehicles.length + 1, name: args.name, manufacturerId: args.manufacturerId };
                vehicles.push(vehicle);
                return vehicle;
            }
        },
        addManufacturer: {
            type: ManufacturerType,
            description: 'Add a manufacturer',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                revenue: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                const manufacturer = { id: manufacturers.length + 1, name: args.name };
                manufacturers.push(manufacturer);
                return manufacturer;
            }
        }
    })
});


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', graphqlHTTP({ schema: schema, rootValue: root, graphiql: true }));

const port = process.env.PORT || 4000;
app.listen(port);
console.log(`API server at localhost:${port}/graphql`);
