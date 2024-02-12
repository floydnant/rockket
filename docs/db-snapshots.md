# DB Snapshots

When developing locally you might accumulate data in the db which is handy when testing new features as you can experience more possible ways the app can behave. So to not have to set this up again and again, you can save snapshots of your db to a json file like explained below.

## Pulling snapshots

Pull a snapshot into `apps/rockket-backend/prisma/backups/snapshots/snapshot-<timestamp>.json`:

```bash
nx run rockket-backend:db:snapshot:pull
```

## Pushing snapshots

Push an existing snapshot to the database:

```bash
nx run rockket-backend:db:snapshot:push <path/to/snapshot>
```
