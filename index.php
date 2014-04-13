<?php
    session_start();
    ob_start();

    if(isset($_SESSION['valid']) && $_SESSION['valid']) {
        header("Location: dnarrow.php");
        die();
    }
    else {
        if(isset($_POST['submit'])) {
            $check_sbm = true;
        }
        else {
            $check_sbm = false;
        }
?>

<html>
    <head>
        <link rel="stylesheet" type="text/css" href="css/dnarrow_login.css" media="screen" />
    </head>
    <body>
        <div>
            <h2>DNArrow 2.1</h2>
            <h5>(c) Andrew Papadopoli 2014</h5>
            <h4>
            	Please log in to your database account
            	<br><em>or</em> start in <a href="dnarrow.html">Offline Mode</a>
                (manual entry only).
            </h4>
        </div>
        <form class="in-block" action="<?php echo $_SERVER['PHP_SELF']?>" method="post">
            <div class="input-area">
                <div class="input-title">Username:</div>
                <input type="text" name="username" maxlength="30">
            </div>
            <div class="input-form">
                <div class="input-title">Password:</div>
                <input type="password" name="pass" maxlength="30">
            </div>
            <input type="submit" name="submit" value="Login">
        </form>

<?php
    }

    if($check_sbm) {
        $usr = $_POST['username'];
        $pwd = $_POST['pass'];

        $check_usr = !!$usr;
        $check_pwd = !!$pwd;

        $check_urf = false; //Initializing other check variables
        $check_cpd = false;

        if($check_usr && $check_pwd) {
            include "private/credentials.php";

            $db = new PDO('mysql:host=localhost;dbname=dnarrowx_users;charset=utf8',
                $credentials["login"]["id"], $credentials["login"]["pass"]);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

            try {
                $stmt = $db->prepare("SELECT * FROM registered_users " .
                        "WHERE username = ?");
                $stmt->execute(array($usr));
            }
            catch(PDOException $ex) {
                echo "There was a problem accessing the user database: " .
                    $ex->getMessage();
            }
            $check_urf = ($stmt->rowCount() > 0 ? true : false);
        }

        if ($check_urf) {
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if ($row['password'] == hash('sha256', $pwd)) {
                    session_regenerate_id();
                    $_SESSION['valid'] = 1;
                    $_SESSION['userid'] = $usr;
                    header("Location: dnarrow.php");
                    die();
                }
                else {
                    $check_cpd = false;
                }
            }
        }
    }
?>

    <div id="login-messages">

<?php
        if(!$check_sbm) {
            //Form not yet submitted, proceed to next check
        } elseif (!$check_usr) {
            echo 'Please enter your username.';
        } elseif (!$check_pwd) {
            echo 'Please enter your password.';
        } elseif (!$check_urf) {
            echo 'Sorry, user <strong>' . $usr .
                '</strong> does not exist.';
        } elseif (!$check_cpd) {
            echo 'Incorrect password for user <strong>' . $usr . '</strong>.';
        }
?>

        </div>
    </body>
</html>