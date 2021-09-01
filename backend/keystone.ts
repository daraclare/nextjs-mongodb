import 'dotenv/config';
import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';

import {withItemData, statelessSessions} from '@keystone-next/keystone/session';
import { insertSeedData } from './seed-data';
const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
    maxAge: 60 * 60 * 24 * 360,  // how long signed in
    secret: process.env.COOKIE_SECRET
}

const {withAuth} = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'email',  'password']
        // TODO: add in roles 
    }
})
export default withAuth(config({
    server: {
        cors: {
            origin: [process.env.FRONTEND_URL],
            credentials: true,
        }
    },
    db: {
        adapter: 'mongoose',
        url: databaseUrl,
       async onConnect(keystone) {
           console.log("connected to the DB", keystone)
           if(process.argv.includes('--seed-data'))
           await insertSeedData(keystone);
       }
    },
    lists: createSchema({
        // TODO: schema items in here
        User,
        Product,
        ProductImage
    }),
    ui: {
        // show UI only people who pass test
        isAccessAllowed: ({session}) => {
            return !!session?.data;
        }
    },
    session: withItemData(statelessSessions(sessionConfig), {
        User: 'id'
    })
}))