
import { API } from "../shared/api";
import RestypedRouter, { TypedRequest } from "restyped-express-async";
import { Router } from "express";
import { log } from "./libs/utils";
import { Auth } from "./auth";
import { RestypedRoute } from "restyped";

const checkAuth = (req: TypedRequest<any>) => !!(req.session && req.session.authed);

export function registerAPI(apiRouter: Router, auth: Auth)
{
    const router = RestypedRouter<API>(apiRouter);

    router.get("/auth", async req => {
        try
        {
            let authed = checkAuth(req);
            if (!authed && await auth.checkPassword("") && req.session)
            {
                req.session.authed = true;
                authed = true;
            }

            return {authed};
        }
        catch(err)
        {
            log.error(`Error getting auth: ${err.toString()}`);
            return { authed: false };
        }
    });

    router.put("/auth", async req => {
        try
        {
            const pw = req.body.password;
    
            if (!checkAuth(req))
            {
                throw new Error("Not logged in!");
            }

            await auth.setPassword(pw)
            return {success: true};
        }
        catch(err)
        {
            log.error(`Error setting password: ${err.toString()}`);
            return { success: false, error: err.toString() };
        }
    });

    router.post("/auth", async req => {
        const pw = req.body.password;
        try
        {
            if (await auth.checkPassword(pw))
            {
                if (req.session) req.session.authed = true;
                return {success: true};
            }
            else
            {
                return {success: false, error: "Wrong password!"};
            }
        }
        catch(err)
        {
            log.error(`Error checking password: ${err.toString()}`);
            return { success: false, error: err.toString() };
        }
    });

    router.delete("/auth", async req => {

        if (!checkAuth(req))
        {
            return { success: false, error: "Not logged in!" };
        }

        (<any>req).session.authed = false;

        return { success: true };
    });

    router.get("/hello-world", async req => {
    
        if (!checkAuth(req))
        {
            return "Good Bye";
        }
        return "Hello World";
    });

    router.post("/hello-world", async req => {
        if (!checkAuth(req))
        {
            return "Good Bye";
        }

        return `Hello ${req.body}`;
    });

}

