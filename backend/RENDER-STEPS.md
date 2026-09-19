# Put the MediaPull engine online with Render (step by step)

No coding needed. About 15 minutes, most of it waiting.

## 1. Create the account
1. Go to https://render.com and click **Get Started**.
2. Sign in with the **GitHub** account that holds this project.
3. Allow Render to see your repositories when GitHub asks.

## 2. Create the service
1. In Render click **New +** → **Web Service**.
2. Pick this project's repository from the list.
3. Fill the form:
   - **Name:** `mediapull-engine`
   - **Language / Runtime:** `Docker`
   - **Root Directory:** `backend`
   - **Region:** pick the one closest to you (e.g. Frankfurt)
   - **Instance type:** Starter ($7/month). The Free type also works but falls
     asleep after 15 minutes and the first extraction after that is very slow.
4. Click **Create Web Service**. The first build takes 5-10 minutes.

## 3. Add your settings
Open the service → **Environment** → **Add Environment Variable**, and add:

| Key | Value |
| --- | --- |
| `ALLOWED_ORIGINS` | `https://mediapull.lovable.app` |
| `BRIGHTDATA_HOST` | `brd.superproxy.io` |
| `BRIGHTDATA_PORT` | `33335` |
| `BRIGHTDATA_CUSTOMER_ID` | your Bright Data customer ID |
| `BRIGHTDATA_ZONE` | your residential zone name |
| `BRIGHTDATA_PASSWORD` | that zone's password |

Click **Save changes** — Render restarts the service automatically.

(Where to find the Bright Data values: Bright Data dashboard → **Proxies &
Scraping** → open your residential zone → **Access parameters**.)

## 4. Check it works
When the status turns **Live**, copy the address at the top of the page. It
looks like `https://mediapull-engine.onrender.com`.

Open `https://mediapull-engine.onrender.com/health` in your browser. You should
see `{"ok":true,"proxy_configured":true}`.

## 5. Send me the address
Paste that address in the chat. I will store it as the website's
`EXTRACTOR_API_URL` setting, switch the "Soon" tools on, and test a real
download end to end.
