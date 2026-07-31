"""
gen_activity_diagram_v2.py — SentinelAQ Activity Diagram (4 swim lanes)
Lanes: User | Mobile Client | API Backend | External Data Providers
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Circle
import matplotlib.patches as mpatches

NAVY="#2d3561";NAVY_L="#3d4b8a";TEAL="#1a8a7a";TEAL_D="#146b5e"
WHITE="#ffffff";GREY_B="#eef0f4";GREY_M="#c8d0da";GREY_D="#5a6275"
RED="#c0392b";PURPLE="#7b2a8e";GREEN="#2d5a3d";ORANGE="#c96a1a"
GOLD="#b8860b"

W,H=28,36
fig,ax=plt.subplots(figsize=(W,H))
ax.set_xlim(0,W);ax.set_ylim(0,H)
ax.axis("off")
fig.patch.set_facecolor(WHITE);ax.set_facecolor(GREY_B)

# Lane geometry
LB=[(0.2,7.0),(7.0,14.0),(14.0,21.0),(21.0,27.8)]
LC=[3.6, 10.5, 17.5, 24.4]
LCOL=[RED, TEAL_D, NAVY, GOLD]
BG=["#fdecea","#e0f5f2","#eaf0fb","#fdf6e3"]
LL=["User","Mobile Client\n(Front-End / UI)","API Gateway /\nApp Backend","External Data\nProviders"]
HTOP=34.2;HBOT=35.6
LTOP=34.2;LBOT=0.5

for i,(x0,x1) in enumerate(LB):
    ax.add_patch(FancyBboxPatch((x0,LBOT),x1-x0,LTOP-LBOT,
        boxstyle="square,pad=0",lw=0,facecolor=BG[i],zorder=0))
    ax.add_patch(FancyBboxPatch((x0,HTOP),x1-x0,HBOT-HTOP,
        boxstyle="square,pad=0",lw=0,facecolor=LCOL[i],zorder=2))
    ax.text(LC[i],(HTOP+HBOT)/2,LL[i],ha="center",va="center",
            fontsize=10.5,fontweight="bold",color=WHITE,
            multialignment="center",zorder=3)
for x0,_ in LB:
    ax.plot([x0,x0],[LBOT,LTOP],color=GREY_M,lw=1.5,zorder=1)
ax.plot([LB[-1][1]]*2,[LBOT,LTOP],color=GREY_M,lw=1.5,zorder=1)
ax.text(W/2,35.3,"SentinelAQ — Activity Diagram (4 Swimlanes)",
        ha="center",fontsize=16,fontweight="bold",color=WHITE,zorder=4)
ax.text(W/2,34.7,"User  ·  Mobile Client  ·  API Backend  ·  External Providers",
        ha="center",fontsize=9,color=WHITE,alpha=0.85,zorder=4)

AW,AH=3.0,0.70

def act(cx,cy,text,color=NAVY,w=AW,h=AH):
    ax.add_patch(FancyBboxPatch((cx-w/2+0.05,cy-h/2-0.05),w,h,
        boxstyle="round,pad=0.05",lw=0,facecolor=GREY_M,zorder=3))
    ax.add_patch(FancyBboxPatch((cx-w/2,cy-h/2),w,h,
        boxstyle="round,pad=0.05",lw=1.4,edgecolor=color,facecolor=WHITE,zorder=4))
    ax.add_patch(FancyBboxPatch((cx-w/2,cy+h/2-0.11),w,0.11,
        boxstyle="square,pad=0",lw=0,facecolor=color,zorder=5))
    ax.text(cx,cy,text,ha="center",va="center",fontsize=7.8,
            color=GREY_D,multialignment="center",zorder=6,linespacing=1.3)
    return{"t":(cx,cy+h/2),"b":(cx,cy-h/2),
           "l":(cx-w/2,cy),"r":(cx+w/2,cy)}

def dec(cx,cy,text,sz=0.65):
    pts=[(cx,cy+sz),(cx+sz*1.7,cy),(cx,cy-sz),(cx-sz*1.7,cy)]
    ax.add_patch(Polygon(pts,closed=True,facecolor=WHITE,
                         edgecolor=ORANGE,lw=1.5,zorder=4))
    ax.text(cx,cy,text,ha="center",va="center",fontsize=7.2,
            color=NAVY,fontweight="bold",multialignment="center",zorder=5)
    return{"t":(cx,cy+sz),"b":(cx,cy-sz),
           "l":(cx-sz*1.7,cy),"r":(cx+sz*1.7,cy)}

def ini(cx,cy):
    ax.add_patch(Circle((cx,cy),0.22,facecolor=RED,zorder=5))

def fin(cx,cy):
    ax.add_patch(Circle((cx,cy),0.35,facecolor=WHITE,edgecolor=NAVY,lw=2,zorder=5))
    ax.add_patch(Circle((cx,cy),0.22,facecolor=NAVY,zorder=6))

def arr(x1,y1,x2,y2,lbl="",col=NAVY,dash=False):
    ax.annotate("",xy=(x2,y2),xytext=(x1,y1),
        arrowprops=dict(arrowstyle="-|>",color=col,lw=1.3,
                        linestyle="--" if dash else "-",
                        connectionstyle="arc3,rad=0"),zorder=7)
    if lbl:
        ax.text((x1+x2)/2+0.1,(y1+y2)/2+0.12,lbl,ha="center",
                fontsize=7.2,color=col,style="italic",zorder=8,
                bbox=dict(facecolor=WHITE,edgecolor="none",pad=0.8))

def seg(pts,lbl="",col=NAVY,dash=False):
    ls="--" if dash else "-"
    for i in range(len(pts)-2):
        ax.plot([pts[i][0],pts[i+1][0]],[pts[i][1],pts[i+1][1]],
                color=col,lw=1.3,linestyle=ls,zorder=7)
    ax.annotate("",xy=pts[-1],xytext=pts[-2],
        arrowprops=dict(arrowstyle="-|>",color=col,lw=1.3,
                        linestyle=ls,connectionstyle="arc3,rad=0"),zorder=7)
    if lbl:
        mx=(pts[-2][0]+pts[-1][0])/2;my=(pts[-2][1]+pts[-1][1])/2
        ax.text(mx+0.1,my+0.12,lbl,ha="center",fontsize=7.2,
                color=col,style="italic",zorder=8,
                bbox=dict(facecolor=WHITE,edgecolor="none",pad=0.8))

def frame(x1,x2,yt,yb,title,sub="",col=NAVY,bg="#e8eaf6"):
    ax.add_patch(FancyBboxPatch((x1,yb),x2-x1,yt-yb,
        boxstyle="square,pad=0",lw=1.5,edgecolor=col,
        facecolor=bg,alpha=0.3,zorder=0))
    tw=max(len(title)*0.09,0.7)
    ax.add_patch(FancyBboxPatch((x1,yt-0.40),tw+0.2,0.40,
        boxstyle="square,pad=0",lw=0,facecolor=col,zorder=1))
    ax.text(x1+0.12,yt-0.20,title,ha="left",va="center",
            fontsize=8,fontweight="bold",color=WHITE,zorder=2)
    if sub:
        ax.text(x1+tw+0.35,yt-0.20,sub,ha="left",va="center",
                fontsize=7.5,color=col,style="italic",zorder=2)

def note(cx,cy,text,bg="#fffde7",brd=ORANGE,w=2.8,h=0.55):
    ax.add_patch(FancyBboxPatch((cx-w/2,cy-h/2),w,h,
        boxstyle="round,pad=0.04",lw=1,facecolor=bg,edgecolor=brd,zorder=6))
    ax.text(cx,cy,text,ha="center",va="center",fontsize=7.2,
            color=GREY_D,multialignment="center",zorder=7)

L1,L2,L3,L4=LC  # 3.6, 10.5, 17.5, 24.4

# ── SECTION A: App Launch & Dashboard ─────────────────────────────────────
frame(0.2,27.8,33.8,22.0,"loop","[User session — app open]",TEAL_D,"#e0f5f2")

ini(L1,33.5)
arr(L1,33.28,L1,33.0)
u_open   = act(L1,32.6,  "Open App",RED)
seg([u_open["r"],(L2-AW/2,32.6),(L2-AW/2,32.0)],col=TEAL_D)
m_check  = act(L2,31.7,  "Check cached\nauth session",TEAL_D)
seg([m_check["r"],(L3-AW/2,31.7),(L3-AW/2,31.2)],col=NAVY)
d_sess   = dec(L3,30.7,  "Session\nvalid?")
b_auth   = act(L3,29.8,  "Authenticate user\n(validate JWT)",NAVY)
seg([d_sess["l"],(L3-1.8,30.7),(L3-1.8,29.8),(L3-AW/2,29.8)],"No",ORANGE)
arr(*d_sess["b"],L3,30.05,"Yes",TEAL_D)
arr(L3,30.05,*b_auth["t"])
# merge: both paths continue to m_loc
seg([b_auth["b"],(L3,29.3),(L2+AW/2+0.1,29.3),(L2+AW/2+0.1,29.05)],col=TEAL_D)
seg([d_sess["b"],(L3,30.05),(L3,29.3)],col=TEAL_D)

m_loc    = act(L2,28.6,  "Request location\npermission",TEAL_D)
seg([m_loc["l"],(L1+AW/2,28.6)],col=RED)
u_grant  = act(L1,28.6,  "Grant permission /\nselect city",RED)
arr(*u_grant["r"],*m_loc["l"])
arr(*m_loc["b"],L2,27.9)
m_send   = act(L2,27.5,  "Send city coords\nto backend",TEAL_D)
seg([m_send["r"],(L3-AW/2,27.5)],col=NAVY)
b_val    = act(L3,27.5,  "Validate session\n+ resolve city",NAVY)
arr(*b_val["b"],L3,26.8)
b_query  = act(L3,26.4,  "Query Firebase\nfor ForecastResult",NAVY)
seg([b_query["r"],(L4-AW/2,26.4)],col=GOLD)
e_fb1    = act(L4,26.4,  "Firebase: return\nForecastResult doc",GOLD)
seg([e_fb1["l"],(L3+AW/2,26.4)],col=NAVY,dash=True)
arr(*b_query["b"],L3,25.7)
b_fmt    = act(L3,25.3,  "Calculate AQI category\n+ format JSON response",NAVY)
seg([b_fmt["l"],(L2+AW/2,25.3)],col=TEAL_D)
m_dash   = act(L2,25.3,  "Render AQI dashboard\n(color-coded dial)",TEAL_D)
arr(*m_dash["b"],L2,24.55)
m_chart  = act(L2,24.2,  "Display 48h forecast\nchart + SHAP insight cards",TEAL_D)
seg([m_chart["l"],(L1+AW/2,24.2)],col=RED)
u_view   = act(L1,24.2,  "Views AQI\ndashboard",RED)
arr(*u_view["b"],L1,23.5)
d_alert  = dec(L1,23.1,  "Set alert\nthreshold?")
# No: loop back up
seg([d_alert["r"],(L1+1.6,23.1),(L1+1.6,24.5),(L1+AW/2,24.5)],"No",ORANGE)

# ── SECTION B: Alert Setup ─────────────────────────────────────────────────
frame(0.2,27.8,22.0,16.8,"alt","[User sets AQI alert threshold]",PURPLE,"#f3e5f5")

arr(*d_alert["b"],L1,22.5,"Yes",TEAL_D)
u_thresh = act(L1,22.1,  "Enter threshold\nvalue & confirm",RED)
seg([u_thresh["r"],(L2-AW/2,22.1)],col=TEAL_D)
m_post   = act(L2,22.1,  "POST alert preference\nto backend",TEAL_D)
seg([m_post["r"],(L3-AW/2,22.1)],col=NAVY)
b_save   = act(L3,22.1,  "Validate preference\n+ save to Firebase",NAVY)
seg([b_save["r"],(L4-AW/2,22.1)],col=GOLD)
e_sub    = act(L4,22.1,  "Firebase stores\nAlertSubscription",GOLD)
seg([e_sub["l"],(L3+AW/2,22.1)],col=NAVY,dash=True)
arr(*b_save["b"],L3,21.4)
b_ok     = act(L3,21.0,  "Return 200 OK\n(preference saved)",NAVY)
seg([b_ok["l"],(L2+AW/2,21.0)],col=TEAL_D)
m_toast  = act(L2,21.0,  "Show 'Alert set!'\nconfirmation toast",TEAL_D)
seg([m_toast["l"],(L1+AW/2,21.0)],col=RED)
u_back   = act(L1,21.0,  "Returns to\ndashboard",RED)
arr(*u_back["b"],L1,20.3)
arr(L1,20.3,L1,23.1+0.65,col=NAVY,dash=True)

# separator note
note(L2,20.0,"Alert active — AQI monitoring\nruns every 3600s in background",
     bg="#fff3e0",brd=ORANGE)

# ── SECTION C: Background Inference & Alert Trigger ────────────────────────
frame(0.2,27.8,19.6,9.8,"loop","[Background — Scheduled Inference (every 3600 s)]",NAVY,"#e8eaf6")

e_pa   = act(L4,19.1,  "PurpleAir API:\ndeliver PM2.5 batch",GOLD)
e_om   = act(L4,18.0,  "Open-Meteo API:\ndeliver weather data",GOLD)
seg([e_pa["l"],(L3+AW/2,19.1)],col=NAVY)
seg([e_om["l"],(L3+AW/2,18.0)],col=NAVY)
b_inf  = act(L3,18.6,  "Run XGBoost\ninference pipeline",NAVY)
arr(*b_inf["b"],L3,17.85)
b_wrt  = act(L3,17.5,  "Write ForecastResult\nto Firebase",NAVY)
seg([b_wrt["r"],(L4-AW/2,17.5)],col=GOLD)
e_fb2  = act(L4,17.5,  "Firebase:\nupdate document",GOLD)
seg([e_fb2["l"],(L3+AW/2,17.5)],col=NAVY,dash=True)
arr(*b_wrt["b"],L3,16.75)
d_thr  = dec(L3,16.4,  "AQI >\nuser threshold?")
# No: done
seg([d_thr["l"],(L3-2.2,16.4),(L3-2.2,15.4)],"No",ORANGE)
fin(L3-2.2,15.1)
arr(*d_thr["b"],L3,15.75,"Yes",TEAL_D)
b_fcm  = act(L3,15.4,  "Prepare FCM push\nnotification payload",NAVY)
seg([b_fcm["r"],(L4-AW/2,15.4)],col=GOLD)
e_fcm  = act(L4,15.4,  "Firebase Cloud\nMessaging (FCM):\ndeliver notification",GOLD,h=0.9)
seg([e_fcm["l"],(L2+AW/2,15.0),(L2+AW/2,14.7)],col=TEAL_D,dash=True)
m_ntf  = act(L2,14.4,  "Receive & display\npush notification",TEAL_D)
seg([m_ntf["l"],(L1+AW/2,14.4)],col=RED)
u_ntf  = act(L1,14.4,  "Views AQI\nalert notification",RED)
arr(*u_ntf["b"],L1,13.7)
d_open = dec(L1,13.3,  "Opens app\nfrom alert?")
# Yes: back to top
seg([d_open["r"],(L1+2.2,13.3),(L1+2.2,32.6),(L1+AW/2,32.6)],"Yes",TEAL_D)
arr(*d_open["b"],L1,12.65,"No",ORANGE)
u_done = act(L1,12.3,  "Dismisses\nnotification",RED)

arr(*u_done["b"],L1,11.5)
fin(L1,11.3)
fin(L3-2.2,15.1)

# ── LEGEND ─────────────────────────────────────────────────────────────────
lx,ly=0.4,10.8
ax.text(lx+0.1,ly+0.3,"Legend",fontsize=9.5,fontweight="bold",color=NAVY,zorder=10)
items=[(RED,"User action"),(TEAL_D,"Mobile Client"),(NAVY,"API Backend"),
       (GOLD,"External Provider"),(ORANGE,"Decision / No branch"),(None,"Return / data flow")]
for i,(col,lbl) in enumerate(items):
    ry=ly-i*0.48-0.12
    if col is None:
        ax.annotate("",xy=(lx+0.78,ry),xytext=(lx+0.10,ry),
            arrowprops=dict(arrowstyle="-|>",color=GREY_D,lw=1.3,linestyle="--"),zorder=6)
    else:
        ax.add_patch(FancyBboxPatch((lx+0.08,ry-0.14),0.55,0.30,
            boxstyle="round,pad=0.03",facecolor=WHITE,edgecolor=col,lw=1.4,zorder=6))
        ax.add_patch(FancyBboxPatch((lx+0.08,ry+0.16-0.09),0.55,0.09,
            boxstyle="square,pad=0",lw=0,facecolor=col,zorder=7))
    ax.text(lx+0.88,ry,lbl,fontsize=7.8,color=GREY_D,va="center",zorder=7)

OUT=r"C:\Users\Yasas\Desktop\AQI app\mock uml diagrams\activity_diagram_v2.png"
plt.savefig(OUT,dpi=180,bbox_inches="tight",facecolor=WHITE)
plt.close()
print(f"✓ Saved -> {OUT}")
