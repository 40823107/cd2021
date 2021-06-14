var tipuesearch = {"pages": [{'title': 'About', 'text': 'github: https://github.com/40823107/cd2021 \n gitlab: https://gitlab.com/40823107/cd2021 \n site: https://40823107.github.io/cd2021/ . \n \n', 'tags': '', 'url': 'About.html'}, {'title': 'Stage', 'text': '', 'tags': '', 'url': 'Stage.html'}, {'title': 'stage1-ag8', 'text': '', 'tags': '', 'url': 'stage1-ag8.html'}, {'title': '主題-1', 'text': '討論小組主題 \n stage1-ag8 機械手臂 動機:爸爸搬重物很辛苦，希望他可以減輕負擔 第二周:繪製零件圖 第三周:進行coppeliasim模擬 第四周:報告 \n 參考圖片 \n \n', 'tags': '', 'url': '主題-1.html'}, {'title': '零件-1', 'text': '組合件 \n \n 夾爪x2 \n \n 夾爪連接 \n \n 連接件 \n \n \n \n \n 底座 \n \n \n \n', 'tags': '', 'url': '零件-1.html'}, {'title': 'coppeliasim模擬', 'text': '\n', 'tags': '', 'url': 'coppeliasim模擬.html'}, {'title': 'stage2-ag8', 'text': '', 'tags': '', 'url': 'stage2-ag8.html'}, {'title': '主題-2', 'text': '', 'tags': '', 'url': '主題-2.html'}, {'title': '零件-2', 'text': '', 'tags': '', 'url': '零件-2.html'}, {'title': '模擬', 'text': '', 'tags': '', 'url': '模擬.html'}, {'title': 'stage3-ag3', 'text': '', 'tags': '', 'url': 'stage3-ag3.html'}, {'title': 'RoboDK', 'text': '\n from robolink import *    # API to communicate with robodk\nfrom robodk import *      # robodk robotics toolbox\n\n# Setup global parameters\nBALL_DIAMETER = 100 # diameter of one ball\nAPPROACH = 100      # approach distance to grab each part, in mm\nnTCPs = 6           # number of TCP\'s in the tool\n\n#----------------------------------------------\n# Function definitions\n\ndef box_calc(BALLS_SIDE=4, BALLS_MAX=None):\n    """Calculate a list of points (ball center) as if the balls were stored in a box"""\n    if BALLS_MAX is None: BALLS_MAX = BALLS_SIDE**3\n    xyz_list = []\n    for h in range(BALLS_SIDE):\n        for i in range(BALLS_SIDE):\n            for j in range(BALLS_SIDE):\n                xyz_list = xyz_list + [[(i+0.5)*BALL_DIAMETER, (j+0.5)*BALL_DIAMETER, (h+0.5)*BALL_DIAMETER]]\n                if len(xyz_list) >= BALLS_MAX:\n                    return xyz_list\n    return xyz_list\n\ndef pyramid_calc(BALLS_SIDE=4):\n    """Calculate a list of points (ball center) as if the balls were place in a pyramid"""\n    #the number of balls can be calculated as: int(BALLS_SIDE*(BALLS_SIDE+1)*(2*BALLS_SIDE+1)/6)\n    BALL_DIAMETER = 100\n    xyz_list = []\n    sqrt2 = 2**(0.5)\n    for h in range(BALLS_SIDE):\n        for i in range(BALLS_SIDE-h):\n            for j in range(BALLS_SIDE-h):\n                height = h*BALL_DIAMETER/sqrt2 + BALL_DIAMETER/2\n                xyz_list = xyz_list + [[i*BALL_DIAMETER + (h+1)*BALL_DIAMETER*0.5, j*BALL_DIAMETER + (h+1)*BALL_DIAMETER*0.5, height]]\n    return xyz_list\n\ndef balls_setup(frame, positions):\n    """Place a list of balls in a reference frame. The reference object (ball) must have been previously copied to the clipboard."""\n    nballs = len(positions)\n    step = 1.0/(nballs - 1)\n    for i in range(nballs):\n        newball = frame.Paste()\n        newball.setName(\'ball \' + str(i)) #set item name\n        newball.setPose(transl(positions[i])) #set item position with respect to parent\n        newball.setVisible(True, False) #make item visible but hide the reference frame\n        newball.Recolor([1-step*i, step*i, 0.2, 1]) #set RGBA color\n\ndef cleanup_balls(parentnodes):\n    """Delete all child items whose name starts with \\"ball\\", from the provided list of parent items."""\n    todelete = []\n    for item in parentnodes:\n        todelete = todelete + item.Childs()\n\n    for item in todelete:\n        if item.Name().startswith(\'ball\'):\n            item.Delete()\n\ndef TCP_On(toolitem, tcp_id):\n    """Attach the closest object to the toolitem Htool pose,\n    furthermore, it will output appropriate function calls on the generated robot program (call to TCP_On)"""\n    toolitem.AttachClosest()\n    toolitem.RDK().RunMessage(\'Set air valve %i on\' % (tcp_id+1))\n    toolitem.RDK().RunProgram(\'TCP_On(%i)\' % (tcp_id+1));\n        \ndef TCP_Off(toolitem, tcp_id, itemleave=0):\n    """Detaches the closest object attached to the toolitem Htool pose,\n    furthermore, it will output appropriate function calls on the generated robot program (call to TCP_Off)"""\n    toolitem.DetachAll(itemleave)\n    toolitem.RDK().RunMessage(\'Set air valve %i off\' % (tcp_id+1))\n    toolitem.RDK().RunProgram(\'TCP_Off(%i)\' % (tcp_id+1));\n\n\n#----------------------------------------------------------\n# The program starts here:\n\n# Any interaction with RoboDK must be done through RDK:\nRDK = Robolink()\n\n# Turn off automatic rendering (faster)\nRDK.Render(False)\n\n#RDK.Set_Simulation_Speed(500); # set the simulation speed\n\n# Gather required items from the station tree\nrobot = RDK.Item(\'Fanuc M-710iC/50\')\nrobot_tools = robot.Childs()\n#robottool = RDK.Item(\'MainTool\')\nframe1 = RDK.Item(\'Table 1\')\nframe2 = RDK.Item(\'Table 2\')\n\n# Copy a ball as an object (same as CTRL+C)\nballref = RDK.Item(\'reference ball\')\nballref.Copy()\n\n# Run a pre-defined station program (in RoboDK) to replace the two tables\nprog_reset = RDK.Item(\'Replace objects\')\nprog_reset.RunProgram()\n\n# Call custom procedure to remove old objects\ncleanup_balls([frame1, frame2])\n\n# Make a list of positions to place the objects\nframe1_list = pyramid_calc(4)\nframe2_list = pyramid_calc(4)\n\n# Programmatically place the objects with a custom-made procedure\nballs_setup(frame1, frame1_list)\n\n# Delete previously generated tools\nfor tool in robot_tools:\n    if tool.Name().startswith(\'TCP\'):\n        tool.Delete()\n        \n# Calculate tool frames for the suction cup tool of 6 suction cups\nTCP_list = []\nfor i in range(nTCPs):\n    TCPi_pose = transl(0,0,100)*rotz((360/nTCPs)*i*pi/180)*transl(125,0,0)*roty(pi/2)\n    TCPi = robot.AddTool(TCPi_pose, \'TCP %i\' % (i+1))\n    TCP_list.append(TCPi)\n\nTCP_0 = TCP_list[0]\n\n# Turn on automatic rendering\nRDK.Render(True)\n\n# Move balls    \nrobot.setPoseTool(TCP_list[0])\nnballs_frame1 = len(frame1_list)\nnballs_frame2 = len(frame2_list)\nidTake = nballs_frame1 - 1\nidLeave = 0\nidTCP = 0\ntarget_app_frame = transl(2*BALL_DIAMETER, 2*BALL_DIAMETER, 4*BALL_DIAMETER)*roty(pi)*transl(0,0,-APPROACH)\n\nwhile idTake >= 0:\n    # ------------------------------------------------------------------\n    # first priority: grab as many balls as possible\n    # the tool is empty at this point, so take as many balls as possible (up to a maximum of 6 -> nTCPs)\n    ntake = min(nTCPs, idTake + 1)\n\n    # approach to frame 1\n    robot.setPoseFrame(frame1)\n    robot.setPoseTool(TCP_0)\n    robot.MoveJ([0,0,0,0,10,-200])\n    robot.MoveJ(target_app_frame)\n\n    # grab ntake balls from frame 1\n    for i in range(ntake):\n        TCPi = TCP_list[i]\n        robot.setPoseTool(TCPi)\n        # calculate target wrt frame1: rotation about Y is needed since Z and X axis are inverted\n        target = transl(frame1_list[idTake])*roty(pi)*rotx(30*pi/180)\n        target_app = target*transl(0,0,-APPROACH)\n        idTake = idTake - 1        \n        robot.MoveL(target_app)\n        robot.MoveL(target)\n        TCP_On(TCPi, i)\n        robot.MoveL(target_app)\n \n    # ------------------------------------------------------------------\n    # second priority: unload the tool     \n    # approach to frame 2 and place the tool balls into table 2\n    robot.setPoseTool(TCP_0)\n    robot.MoveJ(target_app_frame)\n    robot.MoveJ([0,0,0,0,10,-200])\n    robot.setPoseFrame(frame2)    \n    robot.MoveJ(target_app_frame)\n    for i in range(ntake):\n        TCPi = TCP_list[i]\n        robot.setPoseTool(TCPi)\n        if idLeave > nballs_frame2-1:\n            raise Exception("No room left to place objects in Table 2")\n        \n        # calculate target wrt frame1: rotation of 180 about Y is needed since Z and X axis are inverted\n        target = transl(frame2_list[idLeave])*roty(pi)*rotx(30*pi/180)\n        target_app = target*transl(0,0,-APPROACH)\n        idLeave = idLeave + 1        \n        robot.MoveL(target_app)\n        robot.MoveL(target)\n        TCP_Off(TCPi, i, frame2)\n        robot.MoveL(target_app)\n\n    robot.MoveJ(target_app_frame)\n\n# Move home when the robot finishes\nrobot.MoveJ([0,0,0,0,10,-200])\n \n', 'tags': '', 'url': 'RoboDK.html'}, {'title': 'W16', 'text': 'MTB_robot 的取放方塊流程規劃 (Process Planning): \n 1. Onshape 零組件繪製 (20%) \n 零組件必須在 \xa0 Onshape \xa0 繪圖, 並提供可公開分享之零組件連結於頁面及回報區中. \n 2. 建立 CoppeliaSim 4.1.0 MTB robot 場景 (20%) \n 請以自行繪製之零件輸入 CoppeliaSim 後, 組合為 MTB robot 模型, 並利用 Leo Editor 以 require 導入 Lua 程式運作, 分別控制各軸轉動示範, 所完成的所有檔案請存入 W16_exam 後壓縮為 W16_exam.7z 後送至個人 @gm 帳號下的 Google Drive 後將連結設為任何人皆可下載, 並將連結與操作嵌入影片放在 W16 頁面與回報區中 . \n 3. 手臂末端加入 components-gripper-suction pad 吸盤 (20%) \n 請接續上述 MTB robot, 在其末端接上 force sensor 後接上標準 suction pad 後, 分別導入 W15 週線上課程之鍵盤控制程式後, 拍攝影片示範 W15 線上課程中之操作與示範過程. \n 4. 逆向運動學函式 (20%) \n 請根據 W15 線上課程內容之 Inverse Kinematics 方程式 ( 影片1 \xa0 或 影片2 ), 以程式指定方塊取放之兩個位置 - (0.2, 0.7, 0.05) 與 (-0.3, -0.55, 0.05), 以前述 Leo Editor Lua 程式編寫方法, 分別採鍵盤控制與程式迴圈方式執行 W15 兩個指定位置之方塊取放. \n 5. Python remote API 逆向運動學函式 (20%) \n 請利用 Python remote API 程式重現以迴圈方式執行 W15 兩個指定位置之方塊取放. \n \n', 'tags': '', 'url': 'W16.html'}, {'title': 'Onshape 零組件繪製', 'text': '零組件外觀 \n \n Onshape 零組件位置 \n Onshape零組件繪製video \n \n', 'tags': '', 'url': 'Onshape 零組件繪製.html'}, {'title': 'CoppeliaSim 4.1.0 MTB robot 場景', 'text': '加入軸之後模型場景 \n \n CoppeliaSim  stl檔 \n CoppeliaSim操作video', 'tags': '', 'url': 'CoppeliaSim 4.1.0 MTB robot 場景.html'}, {'title': '手臂末端加入 components-gripper-suction pad 吸盤', 'text': '', 'tags': '', 'url': '手臂末端加入 components-gripper-suction pad 吸盤.html'}, {'title': '逆向運動學函式', 'text': '', 'tags': '', 'url': '逆向運動學函式.html'}, {'title': 'Python remote API 逆向運動學函式', 'text': '', 'tags': '', 'url': 'Python remote API 逆向運動學函式.html'}, {'title': 'Task', 'text': '', 'tags': '', 'url': 'Task.html'}, {'title': 'Task1', 'text': '讀取 stage3_2a.txt, 建立 Stage3 的分組倉儲, 分組網頁, 以及各組員倉儲及網頁連結. \n 已知\xa0 stage3_2a.txt \xa0 內容, 以及初步資料讀取程式: \n # open file, default is read mode, since txt content no chinese char\n# no encoding = "UTF-8" is needed\nwith open("stage3_2a.txt") as fh:\n    # readlines will read into the whole line and put into list format\n    # has \\n at the end of each line\n    data = fh.readlines()\n#print(len(data))\nfor i in range(len(data)):\n    group = data[i].rstrip("\\n").split("\\t")\n    print(group)\n# the following will use group data to generate needed html \n 以下為每組亂數抽選 2 名組員的程式碼: \n # open file, default is read mode, since txt content no chinese char\n# no encoding = "UTF-8" is needed\nimport random\n \n# number of group menber to draw\nnum = 2\n \n# check if data is "" or not\ndef notVacant(data):\n    if data == "":\n        return False\n    else:\n        return True\n         \nwith open("stage3_2b.txt") as fh:\n    # readlines will read into the whole line and put into list format\n    # has \\n at the end of each line\n    data = fh.readlines()\n#print(len(data))\n# big group list\nbgroup = []\n# count from the second group member\nsgroup = []\nfor i in range(len(data)):\n    group = data[i].rstrip("\\n").split("\\t")\n    #print(group)\n    # use mem to count the total number of each group\n    mem = 0\n    # final group data\n    fgroup = []\n    # count from the second group member, eliminate the first element\n    sgroup = group[1:]\n    # get only the odd index number\n    igroup = [i for i in range(len(sgroup)) if i % 2 == 1]\n    for j in igroup:\n        # index starts from 0 which is j-1 when j=1\n        if notVacant(sgroup[j-1]) == True:\n            mem += 1\n            fgroup.append(sgroup[j-1])\n    print("group " + str(i+1) + ":" + str(mem))\n    # shuffle the fgroup list\n    random.shuffle(fgroup)\n    # draw num of member from final group list: fgroup\n    for k in range(num):\n        try:\n            print(fgroup[k])\n        except:\n            # num is greater than total number of this group\n            print("no such member")\n    # seperator\n    print("-"*20)\n# the following will use group data to generate needed html \n \n', 'tags': '', 'url': 'Task1.html'}, {'title': 'first task', 'text': 'def stu2a(account):\n\xa0\xa0\xa0\xa0if account == "40823107":\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0return account + "-2"\n\xa0\xa0\xa0\xa0elif account[0:3] == "407":\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0return "s" + account\n\xa0\xa0\xa0\xa0else:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0return account\n\xa0\nteamb = []\n\xa0\n# open file, default is read mode, since txt content no chinese char\n# no encoding = "UTF-8" is needed\nwith open("stage3_2a.txt") as fh:\n\xa0\xa0\xa0\xa0# readlines will read into the whole line and put into list format\n\xa0\xa0\xa0\xa0# has \\n at the end of each line\n\xa0\xa0\xa0\xa0data = fh.readlines()\n#print(len(data))\nfor i in range(len(data)):\n\xa0\xa0\xa0\xa0group = data[i].rstrip("\\n").split("\\t")\n\xa0\xa0\xa0\xa0teamb.append(group)\n\xa0\xa0\xa0\xa0\xa0\noutput = ""\xa0\xa0\xa0 \nseperator = "-"*10 + "<br />"\n\xa0\nfor i in teamb[0:]:\n\xa0\xa0\xa0\xa0team = i[0]\n\xa0\xa0\xa0\xa0leader = stu2a(i[1])\n\xa0\xa0\xa0\xa0m1 = stu2a(i[3])\n\xa0\xa0\xa0\xa0m2 = stu2a(i[5])\n\xa0\xa0\xa0\xa0m3 = stu2a(i[7])\n\xa0\xa0\xa0\xa0m4 = stu2a(i[9])\n\xa0\xa0\xa0\xa0m5 = stu2a(i[11])\n\xa0\xa0\xa0\xa0m6 = stu2a(i[13])\n\xa0\xa0\xa0\xa0\xa0\n\xa0\xa0\xa0\xa0try:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0m7 = stu2a(i[15])\n\xa0\xa0\xa0\xa0except:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0m7 = ""\n\xa0\xa0\xa0\xa0try:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0m8 = stu2a(i[17])\n\xa0\xa0\xa0\xa0except:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0m8 = ""\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\n\xa0\xa0\xa0\xa0leaderrepo = "<a href=\'http://github.com/" + leader + "/cd2021\'>" + leader + " repo</a>"\n\xa0\xa0\xa0\xa0leadersite = "<a href=\'http://" + leader + ".github.io/cd2021\'>" + leader +\xa0 " site</a>"\n\xa0\xa0\xa0\xa0m1repo = "<a href=\'http://github.com/" + m1 + "/cd2021\'>" + m1 + " repo</a>"\n\xa0\xa0\xa0\xa0m1site = "<a href=\'http://" + m1 + ".github.io/cd2021\'>" + m1 +\xa0 " site</a>"\n\xa0\xa0\xa0\xa0m2repo = "<a href=\'http://github.com/" + m2 + "/cd2021\'>" + m2 + " repo</a>"\n\xa0\xa0\xa0\xa0m2site = "<a href=\'http://" + m2 + ".github.io/cd2021\'>" + m2 +\xa0 " site</a>"\n\xa0\xa0\xa0\xa0m3repo = "<a href=\'http://github.com/" + m3 + "/cd2021\'>" + m3 + " repo</a>"\n\xa0\xa0\xa0\xa0m3site = "<a href=\'http://" + m3 + ".github.io/cd2021\'>" + m3 +\xa0 " site</a>"\n\xa0\xa0\xa0\xa0m4repo = "<a href=\'http://github.com/" + m4 + "/cd2021\'>" + m4 + " repo</a>"\n\xa0\xa0\xa0\xa0m4site = "<a href=\'http://" + m4 + ".github.io/cd2021\'>" + m4 +\xa0 " site</a>"\n\xa0\xa0\xa0\xa0m5repo = "<a href=\'http://github.com/" + m5 + "/cd2021\'>" + m5 + " repo</a>"\n\xa0\xa0\xa0\xa0m5site = "<a href=\'http://" + m5 + ".github.io/cd2021\'>" + m5 +\xa0 " site</a>"\n\xa0\xa0\xa0\xa0m6repo = "<a href=\'http://github.com/" + m6 + "/cd2021\'>" + m6 + " repo</a>"\n\xa0\xa0\xa0\xa0m6site = "<a href=\'http://" + m6 + ".github.io/cd2021\'>" + m6 +\xa0 " site</a>"\n\xa0\xa0\n\xa0\n\xa0\xa0\xa0\xa0teamrepo = "<a href=\'http://github.com/" + leader + "/" + team + "\'>" + team + " repo</a>"\n\xa0\xa0\xa0\xa0teamsite =\xa0 "<a href=\'http://" + m1 + ".github.io/" + team + "\'>" + team +\xa0 " site</a>"\n\xa0\n\xa0\xa0\xa0\xa0output += teamrepo + " | " + teamsite + " | " +leaderrepo + " | " + leadersite + " | " +m1repo + " | " + m1site + " | " +m2repo + " | " + m2site + " | " +m3repo + " | " + m3site + " | " +m4repo + " | " + m4site + " | " +m5repo + " | " + m5site + " | " +m6repo + " | " + m6site \n\xa0\xa0\xa0\xa0\xa0\n\xa0\xa0\xa0\xa0if m7 != "":\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0m7repo = "<a href=\'http://github.com/" + m7 + "/cd2021\'>" + m7 + " repo</a>"\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0m7site = "<a href=\'http://" + m7 + ".github.io/cd2021\'>" + m7 +\xa0 " site</a>"\xa0\xa0 \n\xa0\xa0\xa0\xa0\xa0\xa0\xa0output += " |\xa0 " + m7repo + "| " + m7site\n\xa0\xa0\xa0\xa0else:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0output += "" \n\xa0\xa0\xa0\xa0\xa0\n\xa0\xa0\xa0\xa0if m8 != "":\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0m8repo = "<a href=\'http://github.com/" + m8 + "/cd2021\'>" + m8 + " repo</a>"\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0m8site = "<a href=\'http://" + m8 + ".github.io/cd2021\'>" + m8 +\xa0 " site</a>"\xa0\xa0 \n\xa0\xa0\xa0\xa0\xa0\xa0\xa0output += " |\xa0 " + m8repo + "| " + m8site + "<br />" + seperator\n\xa0\xa0\xa0\xa0else:\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0output += "<br />" + seperator\n\xa0\n\xa0\nprint(output)\n# the following will use group data to generate needed html \n 程式結果 \n \n video \n', 'tags': '', 'url': 'first task.html'}, {'title': 'second task', 'text': 'def stu2a(account):\n    if account == "40823107":\n        return account + "-2"\n    elif account[0:3] == "407":\n        return "s" + account\n    else:\n        return account\n \nteamb = []\n \n# open file, default is read mode, since txt content no chinese char\n# no encoding = "UTF-8" is needed\nwith open("stage3_2a.txt") as fh:\n    # readlines will read into the whole line and put into list format\n    # has \\n at the end of each line\n    data = fh.readlines()\n#print(len(data))\nfor i in range(len(data)):\n    group = data[i].rstrip("\\n").split("\\t")\n    teamb.append(group)\n     \noutput = ""    \nseperator = "-"*10 + "<br />"\n \nfor i in teamb[0:]:\n    team = i[0]\n    leader = stu2a(i[1])\n    m1 = stu2a(i[3])\n    m2 = stu2a(i[5])\n    m3 = stu2a(i[7])\n    m4 = stu2a(i[9])\n    m5 = stu2a(i[11])\n    m6 = stu2a(i[13])\n     \n    try:\n        m7 = stu2a(i[15])\n    except:\n        m7 = ""\n    try:\n        m8 = stu2a(i[17])\n    except:\n        m8 = ""\n         \n    leaderrepo = "<a href=\'http://github.com/" + leader + "/cd2021\'>" + leader + " repo</a>"\n    leadersite = "<a href=\'http://" + leader + ".github.io/cd2021\'>" + leader +  " site</a>"\n    m1repo = "<a href=\'http://github.com/" + m1 + "/cd2021\'>" + m1 + " repo</a>"\n    m1site = "<a href=\'http://" + m1 + ".github.io/cd2021\'>" + m1 +  " site</a>"\n    m2repo = "<a href=\'http://github.com/" + m2 + "/cd2021\'>" + m2 + " repo</a>"\n    m2site = "<a href=\'http://" + m2 + ".github.io/cd2021\'>" + m2 +  " site</a>"\n    m3repo = "<a href=\'http://github.com/" + m3 + "/cd2021\'>" + m3 + " repo</a>"\n    m3site = "<a href=\'http://" + m3 + ".github.io/cd2021\'>" + m3 +  " site</a>"\n    m4repo = "<a href=\'http://github.com/" + m4 + "/cd2021\'>" + m4 + " repo</a>"\n    m4site = "<a href=\'http://" + m4 + ".github.io/cd2021\'>" + m4 +  " site</a>"\n    m5repo = "<a href=\'http://github.com/" + m5 + "/cd2021\'>" + m5 + " repo</a>"\n    m5site = "<a href=\'http://" + m5 + ".github.io/cd2021\'>" + m5 +  " site</a>"\n    m6repo = "<a href=\'http://github.com/" + m6 + "/cd2021\'>" + m6 + " repo</a>"\n    m6site = "<a href=\'http://" + m6 + ".github.io/cd2021\'>" + m6 +  " site</a>"\n  \n \n    leaderteamrepo = "<a href=\'http://github.com/" + leader + "/" + team + "\'>" + team + " repo</a>"\n    leaderteamsite =  "<a href=\'http://" + leader + ".github.io/" + team + "\'>" + team +  " site</a>"\n    m1teamrepo = "<a href=\'http://github.com/" + m1 + "/" + team + "\'>" + team + " repo</a>"\n    m1teamsite = "<a href=\'http://" + m1 + ".github.io/" + team + "\'>" + team +  " site</a>"\n    m2teamrepo = "<a href=\'http://github.com/" + m2 + "/" + team + "\'>" + team + " repo</a>"\n    m2teamsite = "<a href=\'http://" + m2 + ".github.io/" + team + "\'>" + team +  " site</a>"\n    m3teamrepo = "<a href=\'http://github.com/" + m3 + "/" + team + "\'>" + team + " repo</a>"\n    m3teamsite = "<a href=\'http://" + m3 + ".github.io/" + team + "\'>" + team +  " site</a>"\n    m4teamrepo = "<a href=\'http://github.com/" + m4 + "/" + team + "\'>" + team + " repo</a>"\n    m4teamsite = "<a href=\'http://" + m4 + ".github.io/" + team + "\'>" + team +  " site</a>"\n    m5teamrepo = "<a href=\'http://github.com/" + m5 + "/" + team + "\'>" + team + " repo</a>"\n    m5teamsite = "<a href=\'http://" + m5 + ".github.io/" + team + "\'>" + team +  " site</a>"\n    m6teamrepo = "<a href=\'http://github.com/" + m6 + "/" + team + "\'>" + team + " repo</a>"\n    m6teamsite = "<a href=\'http://" + m6 + ".github.io/" + team + "\'>" + team +  " site</a>"\n \n    output += leaderrepo + " | " + leadersite + " | " +leaderteamrepo + " | " + leaderteamsite + " | " +m1repo + " | " + m1site + " | " +  m1teamrepo + " | " + m1teamsite + " | " +m2repo + " | " + m2site +  " | "  + m2teamrepo + " | " + m2teamsite + " | " +m3repo + " | " + m3site + " | "  + m3teamrepo + " | " + m3teamsite + " | " +m4repo + " | " + m4site + " | "  + m4teamrepo + " | " + m4teamsite + " | " +m5repo + " | " + m5site + " | "  + m5teamrepo + " | " + m5teamsite + " | " +m6repo + " | " + m6site + " | "  + m6teamrepo + " | " + m6teamsite\n     \n    if m7 != "":\n       m7repo = "<a href=\'http://github.com/" + m7 + "/cd2021\'>" + m7 + " repo</a>"\n       m7site = "<a href=\'http://" + m7 + ".github.io/cd2021\'>" + m7 +  " site</a>"  \n       m7teamrepo = "<a href=\'http://github.com/" + m7 + "/" + team + "\'>" + team + " repo</a>"\n       m7teamsite = "<a href=\'http://" + m7 + ".github.io/" + team + "\'>" + team +  " site</a>"\n       output += " |  " + m7repo + "| " + m7site +  " | "  + m7teamrepo + " | " + m7teamsite\n    else:\n        output += "" \n     \n    if m8 != "":\n       m8repo = "<a href=\'http://github.com/" + m8 + "/cd2021\'>" + m8 + " repo</a>"\n       m8site = "<a href=\'http://" + m8 + ".github.io/cd2021\'>" + m8 +  " site</a>"  \n       m8teamrepo = "<a href=\'http://github.com/" + m8 + "/" + team + "\'>" + team + " repo</a>"\n       m8teamsite = "<a href=\'http://" + m8 + ".github.io/" + team + "\'>" + team +  " site</a>"\n       output += " |  " + m8repo + "| " + m8site +  " | "  + m8teamrepo + " | " + m8teamsite + "<br />" + seperator\n    else:\n        output += "<br />" + seperator\n \n \nprint(output)\n# the following will use group data to generate needed html \n 程式結果 \n 40823131 repo  |  40823131 site  |  stage3_ag1 repo  |  stage3_ag1 site  |  40823112 repo  |  40823112 site  |  stage3_ag1 repo  |  stage3_ag1 site  |  40823123 repo  |  40823123 site  |  stage3_ag1 repo  |  stage3_ag1 site  |  40823145 repo  |  40823145 site  |  stage3_ag1 repo  |  stage3_ag1 site  |  40823136 repo  |  40823136 site  |  stage3_ag1 repo  |  stage3_ag1 site  |  40823109 repo  |  40823109 site  |  stage3_ag1 repo  |  stage3_ag1 site  |  40823116 repo  |  40823116 site  |  stage3_ag1 repo  |  stage3_ag1 site  |  40823108 repo |  40823108 site  |  stage3_ag1 repo  |  stage3_ag1 site ---------- 40823151 repo  |  40823151 site  |  stage3_ag2 repo  |  stage3_ag2 site  |  40623121 repo  |  40623121 site  |  stage3_ag2 repo  |  stage3_ag2 site  |  40871106 repo  |  40871106 site  |  stage3_ag2 repo  |  stage3_ag2 site  |  40823102 repo  |  40823102 site  |  stage3_ag2 repo  |  stage3_ag2 site  |  40823104 repo  |  40823104 site  |  stage3_ag2 repo  |  stage3_ag2 site  |  40823106 repo  |  40823106 site  |  stage3_ag2 repo  |  stage3_ag2 site  |  40823101 repo  |  40823101 site  |  stage3_ag2 repo  |  stage3_ag2 site  |  40823132 repo |  40823132 site  |  stage3_ag2 repo  |  stage3_ag2 site ---------- 40823119 repo  |  40823119 site  |  stage3_ag3 repo  |  stage3_ag3 site  |  40823150 repo  |  40823150 site  |  stage3_ag3 repo  |  stage3_ag3 site  |  40823103 repo  |  40823103 site  |  stage3_ag3 repo  |  stage3_ag3 site  |  40823107-2 repo  |  40823107-2 site  |  stage3_ag3 repo  |  stage3_ag3 site  |  40523252 repo  |  40523252 site  |  stage3_ag3 repo  |  stage3_ag3 site  |  40823154 repo  |  40823154 site  |  stage3_ag3 repo  |  stage3_ag3 site  |   repo  |   site  |  stage3_ag3 repo  |  stage3_ag3 site ---------- 40823142 repo  |  40823142 site  |  stage3_ag4 repo  |  stage3_ag4 site  |  40823144 repo  |  40823144 site  |  stage3_ag4 repo  |  stage3_ag4 site  |  40823127 repo  |  40823127 site  |  stage3_ag4 repo  |  stage3_ag4 site  |  40823148 repo  |  40823148 site  |  stage3_ag4 repo  |  stage3_ag4 site  |  40823121 repo  |  40823121 site  |  stage3_ag4 repo  |  stage3_ag4 site  |  40823135 repo  |  40823135 site  |  stage3_ag4 repo  |  stage3_ag4 site  |  40823114 repo  |  40823114 site  |  stage3_ag4 repo  |  stage3_ag4 site  |  40823146 repo |  40823146 site  |  stage3_ag4 repo  |  stage3_ag4 site ---------- 40823111 repo  |  40823111 site  |  stage3_ag5 repo  |  stage3_ag5 site  |  40823115 repo  |  40823115 site  |  stage3_ag5 repo  |  stage3_ag5 site  |  40823128 repo  |  40823128 site  |  stage3_ag5 repo  |  stage3_ag5 site  |  40823120 repo  |  40823120 site  |  stage3_ag5 repo  |  stage3_ag5 site  |  40823140 repo  |  40823140 site  |  stage3_ag5 repo  |  stage3_ag5 site  |  40823124 repo  |  40823124 site  |  stage3_ag5 repo  |  stage3_ag5 site  |  40823139 repo  |  40823139 site  |  stage3_ag5 repo  |  stage3_ag5 site  |  40823126 repo |  40823126 site  |  stage3_ag5 repo  |  stage3_ag5 site ---------- 40823152 repo  |  40823152 site  |  stage3_ag6 repo  |  stage3_ag6 site  |  40823110 repo  |  40823110 site  |  stage3_ag6 repo  |  stage3_ag6 site  |  40823122 repo  |  40823122 site  |  stage3_ag6 repo  |  stage3_ag6 site  |  40823125 repo  |  40823125 site  |  stage3_ag6 repo  |  stage3_ag6 site  |  40823117 repo  |  40823117 site  |  stage3_ag6 repo  |  stage3_ag6 site  |  40823129 repo  |  40823129 site  |  stage3_ag6 repo  |  stage3_ag6 site  |  40823149 repo  |  40823149 site  |  stage3_ag6 repo  |  stage3_ag6 site  |  40823153 repo |  40823153 site  |  stage3_ag6 repo  |  stage3_ag6 site ---------- \n video \n \n', 'tags': '', 'url': 'second task.html'}, {'title': 'Task2', 'text': '請各組員分別將個人在 stage1 與 stage2 所完成的 coppeliasim 場景, 採 Python remote API 進行操控, 並將過程拍成影片後, 放在個人與分組網站上. \n stage3 專案中的 CoppeliaSim 請一律使用\xa0 4.2.0 版 . \n \n \n', 'tags': '', 'url': 'Task2.html'}, {'title': 'Task3', 'text': 'OBS + Youtube 直播\xa0 \n 直播教大家如何ssh \n', 'tags': '', 'url': 'Task3.html'}]};