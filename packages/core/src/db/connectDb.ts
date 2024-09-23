import { Kysely, sql as _sql } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";

const rds: any = RDS
export const db = new Kysely<any>({
  dialect: new DataApiDialect({
    mode: "postgres",
    driver: {
      database: rds[process.env.clusterId || ""].defaultDatabaseName,
      secretArn: rds[process.env.clusterId || ""].secretArn,
      resourceArn: rds[process.env.clusterId || ""].clusterArn,
      client: new RDSData({})
    }
  }),
});

export const sql = _sql;