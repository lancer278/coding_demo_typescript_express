"use strict";

import async from "async";
import request from "request";
import graph from "fbgraph";
import { Response, Request, NextFunction } from "express";
import { GOOGLEMAPS_API_KEY, CACHETIME } from "../util/secrets";
import { Gmapspos } from "gmaps";
import { Cache } from "cache";

const districts = require("/Users/adam/react/coding_demo_typescript_express/src/data/districts.json");
const inside = require("point-in-geopolygon");
const rp = require("request-promise");
const cache: Cache = {};

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  res.render("api/index", {
    title: "API Examples"
  });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
export let getFacebook = (req: Request, res: Response, next: NextFunction) => {
  const token = req.user.tokens.find((token: any) => token.kind === "facebook");
  graph.setAccessToken(token.accessToken);
  graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err: Error, results: graph.FacebookUser) => {
    if (err) { return next(err); }
    res.render("api/facebook", {
      title: "Facebook API",
      profile: results
    });
  });
};

export let getGoogleCoord =  (req: Request, res: Response, next: NextFunction) => {
  const ADDRESS = req.query.address;
  const NOW = new Date().valueOf();
  const EXPIRE = NOW * 1 + CACHETIME * 1;
  const options = {"url" : "https://maps.googleapis.com/maps/api/geocode/json?address=" + ADDRESS + "&key=" + GOOGLEMAPS_API_KEY,
                   "json" : true
                  };

  if (cache[ADDRESS]) {
    if (cache[ADDRESS].cacheTimeout > NOW) {
      console.log("From cache!");
      const tmp = Object.assign({}, cache[ADDRESS]);
      delete tmp.cacheTimeout;
      return res.send(tmp);
    }
  }

  rp.get(options)
   .then( (locs: Gmapspos) => {
      if (locs.status == "OK") {
        const first = locs.results[0];
        const results = {
          "status": "OK",
          "search": ADDRESS,
          "location": {
            "address": first.formatted_address,
            "lat": first.geometry.location.lat,
            "lng": first.geometry.location.lng
          },
          "serviceArea": "not found"
        };

        if (first.address_components) {
          results.location.city = getAddressComponent(first.address_components, "postal_town");
          results.location.addressNumber = getAddressComponent(first.address_components, "street_number");
          results.location.addressStreet = getAddressComponent(first.address_components, "route");
        }

        const found = inside.feature(districts, [first.geometry.location.lng, first.geometry.location.lat] );
        if (found !== -1) {
          results.serviceArea = found.properties.Name;
        }

        res.send(results);
        results.cacheTimeout = EXPIRE;
        cache[ADDRESS] = results;
      } else if (locs.status == "ZERO_RESULTS") {
        res.send({
            "status": "not found",
            "search": ADDRESS
          });
      } else {
        console.log("Fetch alternative here");
        res.send({
          "status": "unknown error",
          "search": ADDRESS
        });
    }
      next();
   })
    .catch((e: Error) => {
      console.log(e);
      next();
    });
};




function getAddressComponent(address_components: [{"long_name": string, "short_name": string, types: [string]}], item: string) {
  for ( let x = 0; x < address_components.length; x++) {
     if (address_components[x] && address_components[x].types.find( function(type: string) { return type === item; })) {
        return address_components[x].long_name || address_components[x].short_name || "unknown";
     }
  }
  return null;
}



