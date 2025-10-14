<template>
   <v-footer absolute padless min-height="200" color="#e6e6e6" fluid class="d-flex flex-column px-0">
<!--     FOOTER GRIS-->
      <v-row class="footerTopRow" align="start" justify="start" no-gutters>
<!--        DESCRIPTION NAVIGATEUR-->
        <v-col cols="6" id="footerDescription" v-if="mdAndUp">
          <div style="font-size: 1em; font-weight: 700">Quali<span style="font-weight: 400">Marc</span></div>
          <div style="font-size: 0.8em; text-align: justify"><span style="font-weight: 700">Quali<span style="font-weight: 400">Marc</span></span> est un outil qui analyse la qualité des notices bibliographiques du Sudoc : il repère, de manière globale ou ciblée, les absences et/ou incohérences et explique les corrections et/ou enrichissements à apporter.</div>
        </v-col>
<!--        ACCES DIRECT NAVIGATEUR-->
        <v-col cols="auto" id="footerAbesLinks" v-if="mdAndUp">
          <v-row class="ma-0 pa-0">
            <span aria-label="Accès direct" role="img"><v-icon color="#252C61">mdi-open-in-new</v-icon></span>
            <span class="fontPrimaryColor" style="font-size: 1em; font-weight: 700; margin-left: 5px">Accès direct</span>
          </v-row>
         <v-container>
           <span class="pa-0 ma-0" style="font-size: 0.8em; display: block">
             <v-icon color="#cf491b" small>mdi-chevron-right</v-icon>
             <v-tooltip right color="#54576D" dark>
               <template v-slot:activator="{ props }">
                 <a v-bind="props" href="http://www.sudoc.abes.fr/" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet explicative de l'Abes sur le Catalogue Sudoc" target="_blank" class="linkBlue">Sudoc</a>
               </template>
               <span style="color: white">Ouvre Sudoc Abes dans un nouvel onglet</span>
             </v-tooltip>
           </span>
           <span class="pa-0 ma-0" style="font-size: 0.8em; display: block">
             <v-icon color="#cf491b" small>mdi-chevron-right</v-icon>
             <v-tooltip right color="#54576D" dark>
               <template v-slot:activator="{ props }">
                 <a v-bind="props" href="https://documentation.abes.fr/sudoc/" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Guide méthodologique de l'Abes sur le catalogage dans le Sudoc" target="_blank" class="linkBlue">Guide Méthodologique</a>
               </template>
               <span style="color: white">Ouvre le guide méthodologique Sudoc dans un nouvel onglet</span>
             </v-tooltip>           </span>
           <span class="pa-0 ma-0" style="font-size: 0.8em; display: block">
             <v-icon color="#cf491b" small>mdi-chevron-right</v-icon>
             <v-tooltip right color="#54576D" dark>
               <template v-slot:activator="{ props }">
                 <a v-bind="props" href="https://stp.abes.fr/node/3?origine=sudocpro" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Guichet Abes STP" target="_blank" class="linkBlue">Guichet Abes STP</a>
               </template>
               <span style="color: white">Ouvre Abes STP dans un nouvel onglet</span>
             </v-tooltip>
           </span>
         </v-container>
        </v-col>
<!--        ACCES DIRECT MOBILE && TABLETTE-->
        <v-col cols="auto" class="pl-4 pt-2" id="footerAbesLinks" v-if="smAndDown">
          <v-row class="ma-0">
            <span aria-label="Accès direct" role="img"><v-icon color="#252C61">mdi-open-in-new</v-icon></span>
            <span style="color: #252C61; font-size: 1em; font-weight: 500; margin-left: 2px">Accès direct</span>
          </v-row>
          <v-container class="pa-0 pl-2">
          <span class="pa-0 ma-0" style="font-size: 0.8em; display: block">
             <v-icon color="#cf491b" small>mdi-chevron-right</v-icon>
             <v-tooltip bottom color="#54576D" dark>
               <template v-slot:activator="{ props }">
                 <a v-bind="props" href="http://www.sudoc.abes.fr/" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet explicative de l'Abes sur le Catalogue Sudoc" target="_blank" class="linkBlue">Sudoc</a>
               </template>
               <span style="color: white">Ouvre Sudoc Abes dans un nouvel onglet</span>
             </v-tooltip>
          </span>
           <span class="pa-0 ma-0" style="font-size: 0.8em; display: block">
             <v-icon color="#cf491b" small>mdi-chevron-right</v-icon>
             <v-tooltip bottom color="#54576D" dark>
               <template v-slot:activator="{ props }">
                 <a v-bind="props" href="https://documentation.abes.fr/sudoc/" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Guide méthodologique de l'Abes sur le catalogage dans le Sudoc" target="_blank" class="linkBlue">Guide Méthodologique</a>
               </template>
               <span style="color: white">Ouvre le guide méthodologique Sudoc dans un nouvel onglet</span>
             </v-tooltip>
           </span>
            <span class="pa-0 ma-0" style="font-size: 0.8em; display: block">
             <v-icon color="#cf491b" small>mdi-chevron-right</v-icon>
             <v-tooltip bottom color="#54576D" dark>
               <template v-slot:activator="{ props }">
                 <a v-bind="props" href="https://stp.abes.fr/node/3?origine=sudocpro" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Guichet Abes STP" target="_blank" class="linkBlue">Guichet Abes STP</a>
               </template>
               <span style="color: white">Ouvre Abes STP dans un nouvel onglet</span>
             </v-tooltip>
           </span>
          </v-container>
        </v-col>
<!--        LOGOS NAVIGATEUR-->
        <v-col cols="auto" v-if="mdAndUp">
          <span>
            <a href="https://www.enseignementsup-recherche.gouv.fr/fr" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Ministère de l'Enseignement Supérieur et de la Recherche" target="_blank">
              <img class="mr-2"  :src="logoMesr" height="108px" alt="logo Ministère de l'Enseignement supérieur et de la recherche"/>
            </a>
          </span>
          <span style='padding-right: 1em'><a href="https://abes.fr/" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de l'Abes" target="_blank"><img :src="abesLogo130" height="100px" alt="logo Abes"/></a></span>
        </v-col>
<!--        LOGOS MOBILE && TABLETTE-->
        <v-col cols="auto" align-self="end" v-if="smAndDown">
          <span>
            <a href="https://www.enseignementsup-recherche.gouv.fr/fr" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet du Ministère de l'Enseignement Supérieur et de la Recherche" target="_blank">
              <img :src="logoMesr" height="74px" alt="logo Ministère de l'Enseignement supérieur et de la recherche"/>
            </a>
          </span>
          <span style='padding-right: 1em'><a href="https://abes.fr/" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de l'Abes" target="_blank"><img :src="abesLogo130" height="70px" alt="logo Abes"/></a></span>
        </v-col>
      </v-row>

<!--     FOOTER NOIR-->
      <v-row class="footerBottomRow w-100">
         <v-col cols="6" class="mr-auto">
           <div style="font-size: 1em; font-weight: 700">Quali<span style="font-weight: 400">Marc</span> — {{ new Date().getFullYear() }} </div>
         </v-col>
         <v-col cols="auto">
           <v-tooltip top color="#54576D" dark>
             <template v-slot:activator="{ props }">
               <a href="https://abes.fr/pages-donnees-personnelles/qualimarc.sudoc.html" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de traitement des données personnelles de Qualimarc" target="_blank" class="linkWhite">Données personnelles</a>
             </template>
             <span style="color: white">Ouvre, dans un nouvel onglet du navigateur, la page internet de traitement des données personnelles de Qualimarc</span>
           </v-tooltip>|
           <v-tooltip top color="#54576D" dark>
             <template v-slot:activator="{ props }">
               <a v-bind="props" href="https://abes.fr/pages-cgu/conditions-generales-utilisation-sites-abes.html" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de l'Abes sur les C.G.U. (conditions générales d'utilisation) des sites de l'Abes" target="_blank" class="linkWhite">C.G.U.</a>
             </template>
             <span style="color: white">Ouvre dans un nouvel onglet la page internet de l'Abes sur les C.G.U.</span>
           </v-tooltip>
           |
           <v-tooltip top color="#54576D" dark>
             <template v-slot:activator="{ props }">
               <a v-bind="props" href="https://abes.fr/pages-mentions-legales/qualimarc.sudoc.html" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de l'Abes sur les mentions légales" target="_blank" class="linkWhite">Mentions légales</a>
             </template>
             <span style="color: white">Ouvre dans un nouvel onglet la page internet de l'Abes sur les mentions légales</span>
           </v-tooltip>
           |
           <v-tooltip top color="#54576D" dark>
             <template v-slot:activator="{ props }">
               <a v-bind="props" href="https://abes.fr/pages-accessibilite/qualimarc.sudoc.html" aria-label="Ouvre, dans un nouvel onglet du navigateur, la page internet de l'Abes sur l'accessibilité" target="_blank" class="linkWhite">Accessibilité</a>
             </template>
             <span style="color: white">Ouvre dans un nouvel onglet la page internet de l'Abes sur l'accessibilité'</span>
           </v-tooltip>

         </v-col>
      </v-row>

   </v-footer>
</template>
<script setup>
import { useDisplay } from 'vuetify';
import logoMesr from "@/assets/logo-mesr.svg";
import abesLogo130 from "@/assets/abesLogo130.svg";

const { smAndDown, mdAndUp } = useDisplay()
</script>